import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readOneHandler, updateHandler, deleteHandler, SectionConfig } from "@/lib/sections";
import { servicesCreateSchema, servicesUpdateSchema } from "../_schema";

type ServiceCreate = z.infer<typeof servicesCreateSchema>;
type ServiceUpdate = z.infer<typeof servicesUpdateSchema>;

const config: SectionConfig<ServiceCreate, ServiceUpdate> = {
  model: prisma.service,
  createSchema: servicesCreateSchema,
  updateSchema: servicesUpdateSchema,
};

export const GET = readOneHandler(config);
export const PATCH = updateHandler(config);
export const DELETE = deleteHandler(config);
