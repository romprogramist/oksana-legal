import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidateHome } from "@/lib/revalidate";

const schema = z.object({ ids: z.array(z.number().int().positive()) });

export async function POST(req: NextRequest) {
  let body;
  try { body = schema.parse(await req.json()); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  await prisma.$transaction(
    body.ids.map((id, index) =>
      prisma.testimonial.update({ where: { id }, data: { sortOrder: (index + 1) * 10 } })
    )
  );
  revalidateHome();
  return NextResponse.json({ ok: true });
}
