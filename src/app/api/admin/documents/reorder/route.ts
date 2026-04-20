import { prisma } from "@/lib/prisma";
import { reorderHandler, SectionConfig } from "@/lib/sections";
import { documentsCreateSchema, documentsUpdateSchema } from "../_schema";

const config: SectionConfig<any, any> = {
  model: prisma.documentSample,
  createSchema: documentsCreateSchema,
  updateSchema: documentsUpdateSchema,
};

export const POST = reorderHandler(config);
