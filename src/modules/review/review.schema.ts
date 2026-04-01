import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(10),
  content: z.string().min(10).max(5000),
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
  hasSpoiler: z.boolean().default(false),
  mediaId: z.string().min(1),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(10).optional(),
  content: z.string().min(10).max(5000).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  hasSpoiler: z.boolean().optional(),
});

export const reviewStatusSchema = z.object({
  status: z.enum(["PUBLISHED", "UNPUBLISHED"]),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
