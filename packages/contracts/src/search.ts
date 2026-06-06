import { z } from "zod";

import { categoryKeySchema } from "./categories.js";
import { productSummarySchema } from "./products.js";

export const productSearchRequestSchema = z.object({
  q: z.string().min(1),
  category: categoryKeySchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

export const productSearchResponseSchema = z.object({
  items: z.array(productSummarySchema),
});

export type ProductSearchRequest = z.infer<typeof productSearchRequestSchema>;
export type ProductSearchResponse = z.infer<typeof productSearchResponseSchema>;
