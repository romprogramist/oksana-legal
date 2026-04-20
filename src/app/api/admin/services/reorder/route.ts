import { prisma } from "@/lib/prisma";
import { reorderHandler, SectionConfig } from "@/lib/sections";
import { servicesCreateSchema, servicesUpdateSchema } from "../_schema";

const config: SectionConfig<any, any> = {
  model: prisma.service,
  createSchema: servicesCreateSchema,
  updateSchema: servicesUpdateSchema,
};

export const POST = reorderHandler(config);
