import { z } from "zod";

export const categoryKeySchema = z.string().min(1);

export const categorySchema = z.object({
  key: categoryKeySchema,
  name: z.string().min(1),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export type CategoryKeyInput = z.infer<typeof categoryKeySchema>;
export type Category = z.infer<typeof categorySchema>;
