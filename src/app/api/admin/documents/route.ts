import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createHandler, listHandler, SectionConfig } from "@/lib/sections";
import { documentsCreateSchema, documentsUpdateSchema } from "./_schema";

type DocumentCreate = z.infer<typeof documentsCreateSchema>;
type DocumentUpdate = z.infer<typeof documentsUpdateSchema>;

const config: SectionConfig<DocumentCreate, DocumentUpdate> = {
  model: prisma.documentSample,
  createSchema: documentsCreateSchema,
  updateSchema: documentsUpdateSchema,
};

export const GET = listHandler(config);
export const POST = createHandler(config);
