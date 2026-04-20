import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    const testimonials = await prisma.testimonial.findMany({
      where: all === "true" ? {} : { isApproved: true, isActive: true },
      orderBy: all === "true"
        ? { createdAt: "desc" }
        : [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(testimonials);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const testimonialSchema = z.object({
  name: z.string().min(2).max(100),
  content: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = testimonialSchema.parse(body);

    await prisma.testimonial.create({
      data: {
        name: data.name,
        content: data.content,
        rating: data.rating,
        isApproved: false,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
