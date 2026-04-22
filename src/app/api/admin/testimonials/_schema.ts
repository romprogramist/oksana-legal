import { z } from "zod";

export const testimonialStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const testimonialCreateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  rating: z.number().int().min(1).max(5).default(5),
  photoUrl: z.string().max(500).optional().nullable(),
  status: testimonialStatusSchema.default("approved"),
  isActive: z.boolean().default(true),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();
