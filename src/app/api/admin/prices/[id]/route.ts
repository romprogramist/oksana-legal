import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readOneHandler, updateHandler, deleteHandler, SectionConfig } from "@/lib/sections";
import { pricesCreateSchema, pricesUpdateSchema } from "../_schema";

type PriceCreate = z.infer<typeof pricesCreateSchema>;
type PriceUpdate = z.infer<typeof pricesUpdateSchema>;

const config: SectionConfig<PriceCreate, PriceUpdate> = {
  model: prisma.priceItem,
  createSchema: pricesCreateSchema,
  updateSchema: pricesUpdateSchema,
};

export const GET = readOneHandler(config);
export const PATCH = updateHandler(config);
export const DELETE = deleteHandler(config);
