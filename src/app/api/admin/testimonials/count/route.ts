import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pending = await prisma.testimonial.count({ where: { status: "pending" } });
  return NextResponse.json({ pending });
}
