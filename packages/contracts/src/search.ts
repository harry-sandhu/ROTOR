import { z } from "zod";

import { categoryKeySchema } from "./categories.js";
import { paginatedProductListSchema, productSummarySchema } from "./products.js";

export const productSearchRequestSchema = z.object({
  q: z.string().min(1),
  category: categoryKeySchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

export const searchSuggestionSchema = z.object({
  value: z.string().min(1),
  type: z.enum(["PRODUCT", "BRAND", "CATEGORY", "SPEC_TOKEN"]),
});

export const productSearchResponseSchema = paginatedProductListSchema;

export const searchSuggestionsResponseSchema = z.object({
  query: z.string().min(1),
  suggestions: z.array(searchSuggestionSchema),
  previewProducts: z.array(productSummarySchema),
});

export type ProductSearchRequest = z.infer<typeof productSearchRequestSchema>;
export type SearchSuggestion = z.infer<typeof searchSuggestionSchema>;
export type ProductSearchResponse = z.infer<typeof productSearchResponseSchema>;
export type SearchSuggestionsResponse = z.infer<typeof searchSuggestionsResponseSchema>;
