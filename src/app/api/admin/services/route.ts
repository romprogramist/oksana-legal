import { prisma } from "@/lib/prisma";
import { createHandler, listHandler, SectionConfig } from "@/lib/sections";
import { servicesCreateSchema, servicesUpdateSchema } from "./_schema";

const config: SectionConfig<any, any> = {
  model: prisma.service,
  createSchema: servicesCreateSchema,
  updateSchema: servicesUpdateSchema,
};

export const GET = listHandler(config);
export const POST = createHandler(config);
