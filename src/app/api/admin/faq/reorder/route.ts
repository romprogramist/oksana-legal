import { prisma } from "@/lib/prisma";
import { reorderHandler, SectionConfig } from "@/lib/sections";
import { faqCreateSchema, faqUpdateSchema } from "../_schema";

const config: SectionConfig<any, any> = {
  model: prisma.faqItem,
  createSchema: faqCreateSchema,
  updateSchema: faqUpdateSchema,
};

export const POST = reorderHandler(config);
