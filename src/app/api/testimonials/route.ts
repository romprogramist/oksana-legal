import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkReviewRateLimit } from "@/lib/rate-limit";
import { revalidateHome } from "@/lib/revalidate";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: "approved", isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(testimonials);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const publicReviewSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя (минимум 2 символа)").max(100, "Имя слишком длинное"),
  content: z.string().trim().min(3, "Напишите пару слов (минимум 3 символа)").max(1000, "Текст слишком длинный"),
  rating: z.number().int().min(1, "Поставьте оценку").max(5, "Некорректная оценка"),
  website: z.string().optional(),
});

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = publicReviewSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of err.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      return NextResponse.json({ error: "Invalid data", fields: fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (parsed.website && parsed.website.length > 0) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const ip = getClientIp(req);
  const rl = checkReviewRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many reviews from this IP, try again later" },
      { status: 429, headers: { "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  try {
    await prisma.testimonial.create({
      data: {
        name: parsed.name,
        content: parsed.content,
        rating: parsed.rating,
        status: "pending",
      },
    });
    revalidateHome();
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
