import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readOneHandler, updateHandler, deleteHandler, SectionConfig } from "@/lib/sections";
import { documentsCreateSchema, documentsUpdateSchema } from "../_schema";

type DocumentCreate = z.infer<typeof documentsCreateSchema>;
type DocumentUpdate = z.infer<typeof documentsUpdateSchema>;

const config: SectionConfig<DocumentCreate, DocumentUpdate> = {
  model: prisma.documentSample,
  createSchema: documentsCreateSchema,
  updateSchema: documentsUpdateSchema,
};

export const GET = readOneHandler(config);
export const PATCH = updateHandler(config);
export const DELETE = deleteHandler(config);
