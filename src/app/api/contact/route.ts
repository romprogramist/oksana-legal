import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(5).max(20),
  email: z.string().email().max(100).optional(),
  message: z.string().max(2000).optional(),
  quizAnswers: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    await prisma.contactRequest.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        message: data.message ?? null,
        quizAnswers: data.quizAnswers ?? undefined,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("list") !== "true") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const contacts = await prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(contacts);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
