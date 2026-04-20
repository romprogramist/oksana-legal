import { z } from "zod";

export const servicesCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  imageUrl: z.string().max(500).default(""),
  tags: z.array(z.string().min(1).max(100)).max(10).default([]),
  isActive: z.boolean().default(true),
});

export const servicesUpdateSchema = servicesCreateSchema.partial();
