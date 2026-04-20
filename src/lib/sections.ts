/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateHome } from "@/lib/revalidate";
import { z } from "zod";

type PrismaSectionModel = {
  findMany: (args: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  count: () => Promise<number>;
};

export type SectionConfig<TCreate, TUpdate> = {
  model: PrismaSectionModel;
  createSchema: z.ZodType<TCreate>;
  updateSchema: z.ZodType<TUpdate>;
};

export function listHandler(cfg: SectionConfig<any, any>) {
  return async function GET() {
    const items = await cfg.model.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json(items);
  };
}

export function createHandler(cfg: SectionConfig<any, any>) {
  return async function POST(req: NextRequest) {
    let body;
    try {
      body = cfg.createSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const maxRow = await cfg.model.findMany({ orderBy: { sortOrder: "desc" }, take: 1 });
    const nextSort = maxRow.length ? maxRow[0].sortOrder + 10 : 10;
    const created = await cfg.model.create({ data: { ...body, sortOrder: nextSort } });
    revalidateHome();
    return NextResponse.json(created, { status: 201 });
  };
}

export function readOneHandler(cfg: SectionConfig<any, any>) {
  return async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
    const item = await cfg.model.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  };
}

export function updateHandler(cfg: SectionConfig<any, any>) {
  return async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
    let body;
    try {
      body = cfg.updateSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    try {
      const updated = await cfg.model.update({ where: { id }, data: body });
      revalidateHome();
      return NextResponse.json(updated);
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  };
}

export function deleteHandler(cfg: SectionConfig<any, any>) {
  return async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
    try {
      await cfg.model.delete({ where: { id } });
      revalidateHome();
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  };
}

const reorderSchema = z.object({ ids: z.array(z.number().int().positive()) });

export function reorderHandler(cfg: SectionConfig<any, any>) {
  return async function POST(req: NextRequest) {
    let body;
    try {
      body = reorderSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    await prisma.$transaction(async () => {
      for (let index = 0; index < body.ids.length; index++) {
        const id = body.ids[index];
        await cfg.model.update({ where: { id }, data: { sortOrder: (index + 1) * 10 } });
      }
    });
    revalidateHome();
    return NextResponse.json({ ok: true });
  };
}
