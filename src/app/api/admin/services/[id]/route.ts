import { prisma } from "@/lib/prisma";
import { readOneHandler, updateHandler, deleteHandler, SectionConfig } from "@/lib/sections";
import { servicesCreateSchema, servicesUpdateSchema } from "../_schema";

const config: SectionConfig<any, any> = {
  model: prisma.service,
  createSchema: servicesCreateSchema,
  updateSchema: servicesUpdateSchema,
};

export const GET = readOneHandler(config);
export const PATCH = updateHandler(config);
export const DELETE = deleteHandler(config);
