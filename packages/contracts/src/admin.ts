import { z } from "zod";

import { buildVisibilitySchema } from "./builds.js";
import { categoryKeySchema } from "./categories.js";
import { productStatusSchema } from "./products.js";
import { specificationDataTypeSchema, specificationValueSchema } from "./specifications.js";

export const adminValidationIssueSchema = z.object({
  field: z.string().min(1),
  message: z.string().min(1),
});

export const adminValidationResultSchema = z.object({
  isValid: z.boolean(),
  issues: z.array(adminValidationIssueSchema),
});

export const adminSpecificationInputSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  dataType: specificationDataTypeSchema,
  unit: z.string().nullable().optional(),
  validation: z.record(z.string(), z.unknown()).default({}),
  searchWeight: z.number().int().default(0),
  isFilterable: z.boolean().default(false),
  isSearchable: z.boolean().default(false),
});

export const adminCategorySpecificationAssignmentSchema = z.object({
  specificationKey: z.string().min(1),
  isRequired: z.boolean(),
  isFilterable: z.boolean(),
  isVisibleOnCard: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
});

export const adminCompatibilityRuleInputSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  fromCategoryKey: categoryKeySchema,
  toCategoryKey: categoryKeySchema,
  leftSpecificationKey: z.string().min(1),
  operator: z.enum(["EQ", "NEQ", "GTE", "LTE", "RANGE_CONTAINS", "RANGE_OVERLAPS", "ARRAY_CONTAINS", "ARRAY_OVERLAPS"]),
  rightSpecificationKey: z.string().min(1),
  severityOnFail: z.enum(["WARNING", "INCOMPATIBLE"]),
  successMessageTemplate: z.string().nullable().optional(),
  failureMessageTemplate: z.string().min(1),
  warningThreshold: z.record(z.string(), z.unknown()).nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const adminProductImageInputSchema = z.object({
  imageUrl: z.string().url(),
  altText: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const adminProductInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  categoryKey: categoryKeySchema,
  description: z.string().nullable().optional(),
  priceCents: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative(),
  status: productStatusSchema.default("DRAFT"),
  thumbnailUrl: z.string().url().nullable().optional(),
  specs: z.record(z.string(), specificationValueSchema).default({}),
  images: z.array(adminProductImageInputSchema).default([]),
});

export const adminProductImportSchema = z.object({
  commit: z.boolean().default(false),
  items: z.array(adminProductInputSchema).min(1),
});

export type AdminValidationIssue = z.infer<typeof adminValidationIssueSchema>;
export type AdminValidationResult = z.infer<typeof adminValidationResultSchema>;
export type AdminSpecificationInput = z.infer<typeof adminSpecificationInputSchema>;
export type AdminCategorySpecificationAssignment = z.infer<typeof adminCategorySpecificationAssignmentSchema>;
export type AdminCompatibilityRuleInput = z.infer<typeof adminCompatibilityRuleInputSchema>;
export type AdminProductImageInput = z.infer<typeof adminProductImageInputSchema>;
export type AdminProductInput = z.infer<typeof adminProductInputSchema>;
export type AdminProductImportInput = z.infer<typeof adminProductImportSchema>;
