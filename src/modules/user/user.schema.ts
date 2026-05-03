import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  image: z
    .union([z.string().trim().url(), z.string().trim().length(0), z.undefined()])
    .transform((value) => (value ? value : undefined))
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
