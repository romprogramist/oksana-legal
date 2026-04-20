import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readOneHandler, updateHandler, deleteHandler, SectionConfig } from "@/lib/sections";
import { faqCreateSchema, faqUpdateSchema } from "../_schema";

type FAQCreate = z.infer<typeof faqCreateSchema>;
type FAQUpdate = z.infer<typeof faqUpdateSchema>;

const config: SectionConfig<FAQCreate, FAQUpdate> = {
  model: prisma.faqItem,
  createSchema: faqCreateSchema,
  updateSchema: faqUpdateSchema,
};

export const GET = readOneHandler(config);
export const PATCH = updateHandler(config);
export const DELETE = deleteHandler(config);
