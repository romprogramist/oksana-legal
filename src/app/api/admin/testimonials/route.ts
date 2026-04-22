import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateHome } from "@/lib/revalidate";
import { testimonialCreateSchema, testimonialStatusSchema } from "./_schema";

export async function GET(req: NextRequest) {
  const statusParam = req.nextUrl.searchParams.get("status");
  let where = {};
  if (statusParam) {
    const parsed = testimonialStatusSchema.safeParse(statusParam);
    if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    where = { status: parsed.data };
  }
  const items = await prisma.testimonial.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = testimonialCreateSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const max = await prisma.testimonial.findMany({ orderBy: { sortOrder: "desc" }, take: 1 });
  const nextSort = max.length ? max[0].sortOrder + 10 : 10;
  const created = await prisma.testimonial.create({ data: { ...body, sortOrder: nextSort } });
  revalidateHome();
  return NextResponse.json(created, { status: 201 });
}
