import { prisma } from "@/lib/prisma";
import { readOneHandler, updateHandler, deleteHandler, SectionConfig } from "@/lib/sections";
import { faqCreateSchema, faqUpdateSchema } from "../_schema";

const config: SectionConfig<any, any> = {
  model: prisma.faqItem,
  createSchema: faqCreateSchema,
  updateSchema: faqUpdateSchema,
};

export const GET = readOneHandler(config);
export const PATCH = updateHandler(config);
export const DELETE = deleteHandler(config);
