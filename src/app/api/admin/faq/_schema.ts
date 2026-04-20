import { z } from "zod";

export const faqCreateSchema = z.object({
  question: z.string().min(3).max(1000),
  answer: z.string().min(3).max(10000),
  isActive: z.boolean().default(true),
});

export const faqUpdateSchema = faqCreateSchema.partial();
