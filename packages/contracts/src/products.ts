import { z } from "zod";

import { categoryKeySchema } from "./categories.js";
import { productSpecificationSchema } from "./specifications.js";

export const productStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const productSpecificationSummarySchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
});

export const productImageSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().url(),
  altText: z.string().nullable(),
  sortOrder: z.number().int(),
});

export const productSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  category: categoryKeySchema,
  priceCents: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative(),
  status: productStatusSchema,
  thumbnailUrl: z.string().url().nullable(),
  summarySpecs: z.array(productSpecificationSummarySchema),
});

export const productCompatibilitySummarySchema = z.object({
  targetCategory: categoryKeySchema,
  compatibleCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  incompatibleCount: z.number().int().nonnegative(),
});

export const productDetailSchema = productSummarySchema.extend({
  description: z.string().nullable(),
  images: z.array(productImageSchema),
  specifications: z.array(productSpecificationSchema),
  compatibilitySummary: z.array(productCompatibilitySummarySchema),
  alternativeProducts: z.array(productSummarySchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const paginatedProductListSchema = z.object({
  items: z.array(productSummarySchema),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductSpecificationSummary = z.infer<typeof productSpecificationSummarySchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductSummary = z.infer<typeof productSummarySchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type PaginatedProductList = z.infer<typeof paginatedProductListSchema>;
