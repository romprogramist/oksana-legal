import { z } from "zod";

export const testimonialCreateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  rating: z.number().int().min(1).max(5).default(5),
  photoUrl: z.string().max(500).optional().nullable(),
  isApproved: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();
