import { z } from "zod";

export const pricesCreateSchema = z.object({
  title: z.string().min(1).max(200),
  note: z.string().max(2000).optional().nullable(),
  price: z.string().min(1).max(100),
  isActive: z.boolean().default(true),
});

export const pricesUpdateSchema = pricesCreateSchema.partial();
