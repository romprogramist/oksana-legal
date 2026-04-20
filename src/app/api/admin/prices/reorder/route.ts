import { prisma } from "@/lib/prisma";
import { reorderHandler, SectionConfig } from "@/lib/sections";
import { pricesCreateSchema, pricesUpdateSchema } from "../_schema";

const config: SectionConfig<any, any> = {
  model: prisma.priceItem,
  createSchema: pricesCreateSchema,
  updateSchema: pricesUpdateSchema,
};

export const POST = reorderHandler(config);
