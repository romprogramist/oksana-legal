import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateHome } from "@/lib/revalidate";
import { testimonialCreateSchema, testimonialUpdateSchema } from "./_schema";

export { testimonialCreateSchema as createSchema, testimonialUpdateSchema as updateSchema };

export async function GET() {
  const items = await prisma.testimonial.findMany({
    orderBy: [{ isApproved: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
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
