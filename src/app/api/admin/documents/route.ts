import { prisma } from "@/lib/prisma";
import { createHandler, listHandler, SectionConfig } from "@/lib/sections";
import { documentsCreateSchema, documentsUpdateSchema } from "./_schema";

const config: SectionConfig<any, any> = {
  model: prisma.documentSample,
  createSchema: documentsCreateSchema,
  updateSchema: documentsUpdateSchema,
};

export const GET = listHandler(config);
export const POST = createHandler(config);
