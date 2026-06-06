import { z } from "zod";

import { categoryKeySchema } from "./categories.js";
import { compatibilityEvaluationSchema } from "./compatibility.js";
import { productSummarySchema } from "./products.js";

export const buildVisibilitySchema = z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]);

export const buildComponentSchema = z.object({
  category: categoryKeySchema,
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  product: productSummarySchema.optional(),
});

export const buildSummarySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  name: z.string().min(1),
  description: z.string().nullable(),
  visibility: buildVisibilitySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const buildDetailSchema = buildSummarySchema.extend({
  components: z.array(buildComponentSchema),
  evaluation: compatibilityEvaluationSchema.optional(),
});

export const createBuildRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  visibility: buildVisibilitySchema,
});

export const updateBuildComponentRequestSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export type BuildVisibility = z.infer<typeof buildVisibilitySchema>;
export type BuildComponent = z.infer<typeof buildComponentSchema>;
export type BuildSummary = z.infer<typeof buildSummarySchema>;
export type BuildDetail = z.infer<typeof buildDetailSchema>;
export type CreateBuildRequest = z.infer<typeof createBuildRequestSchema>;
export type UpdateBuildComponentRequest = z.infer<typeof updateBuildComponentRequestSchema>;
