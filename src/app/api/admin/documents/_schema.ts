import { z } from "zod";

export const documentsCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  fileUrl: z.string().min(1).max(500),
  fileSize: z.number().int().nonnegative().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const documentsUpdateSchema = documentsCreateSchema.partial();
