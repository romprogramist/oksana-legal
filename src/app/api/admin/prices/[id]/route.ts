import { prisma } from "@/lib/prisma";
import { readOneHandler, updateHandler, deleteHandler, SectionConfig } from "@/lib/sections";
import { pricesCreateSchema, pricesUpdateSchema } from "../_schema";

const config: SectionConfig<any, any> = {
  model: prisma.priceItem,
  createSchema: pricesCreateSchema,
  updateSchema: pricesUpdateSchema,
};

export const GET = readOneHandler(config);
export const PATCH = updateHandler(config);
export const DELETE = deleteHandler(config);
