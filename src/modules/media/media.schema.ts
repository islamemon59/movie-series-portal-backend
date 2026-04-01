import { z } from "zod";

export const createMediaSchema = z.object({
  title: z.string().min(1).max(200),
  synopsis: z.string().min(10).max(5000),
  type: z.enum(["MOVIE", "SERIES"]),
  genres: z.array(z.string().min(1)).min(1),
  releaseYear: z.number().int().min(1900).max(2030),
  director: z.string().min(1).max(200),
  cast: z.array(z.string().min(1)).min(1),
  streamingPlatforms: z.array(z.string().min(1)).min(1),
  posterUrl: z.string().url().optional().or(z.literal("")),
  trailerUrl: z.string().url().optional().or(z.literal("")),
  pricing: z.enum(["FREE", "PREMIUM"]).default("FREE"),
  featured: z.boolean().default(false),
});

export const updateMediaSchema = createMediaSchema.partial();

export const mediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  type: z.enum(["MOVIE", "SERIES"]).optional(),
  genre: z.string().optional(),
  platform: z.string().optional(),
  yearFrom: z.coerce.number().int().optional(),
  yearTo: z.coerce.number().int().optional(),
  ratingMin: z.coerce.number().min(0).max(10).optional(),
  pricing: z.enum(["FREE", "PREMIUM"]).optional(),
  sort: z
    .enum(["latest", "oldest", "title", "rating", "most-reviewed"])
    .default("latest"),
  featured: z.coerce.boolean().optional(),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type MediaQueryInput = z.infer<typeof mediaQuerySchema>;
