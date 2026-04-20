import { prisma } from "@/lib/prisma";
import { readOneHandler, updateHandler, deleteHandler, SectionConfig } from "@/lib/sections";
import { documentsCreateSchema, documentsUpdateSchema } from "../_schema";

const config: SectionConfig<any, any> = {
  model: prisma.documentSample,
  createSchema: documentsCreateSchema,
  updateSchema: documentsUpdateSchema,
};

export const GET = readOneHandler(config);
export const PATCH = updateHandler(config);
export const DELETE = deleteHandler(config);
