import { z } from "zod";

import { categoryKeySchema } from "./categories.js";
import { productSummarySchema } from "./products.js";

export const ruleOperatorSchema = z.enum(["EQ", "NEQ", "GTE", "LTE", "RANGE_CONTAINS", "RANGE_OVERLAPS", "ARRAY_CONTAINS", "ARRAY_OVERLAPS"]);
export const compatibilityStatusSchema = z.enum(["COMPATIBLE", "WARNING", "INCOMPATIBLE"]);
export const buildValidationStatusSchema = z.enum(["INCOMPLETE", "VALID", "VALID_WITH_WARNINGS", "INVALID"]);

export const buildSelectionSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const compatibilityIssueSchema = z.object({
  status: z.enum(["WARNING", "INCOMPATIBLE"]),
  code: z.string().min(1),
  message: z.string().min(1),
  categories: z.array(categoryKeySchema),
  productIds: z.array(z.string().uuid()),
  ruleKey: z.string().min(1).optional(),
});

export const compatibilityCheckResultSchema = z.object({
  ruleKey: z.string().min(1),
  fromCategory: categoryKeySchema,
  toCategory: categoryKeySchema,
  status: compatibilityStatusSchema,
  message: z.string().min(1),
  leftValue: z.unknown(),
  rightValue: z.unknown(),
});

export const compatibilityEvaluationSchema = z.object({
  overallStatus: compatibilityStatusSchema,
  validationStatus: buildValidationStatusSchema,
  score: z.number().int().min(0).max(100),
  totalCostCents: z.number().int().nonnegative(),
  missingCategories: z.array(categoryKeySchema),
  issues: z.array(compatibilityIssueSchema),
  checks: z.array(compatibilityCheckResultSchema),
});

export const compatibilityEvaluateRequestSchema = z.object({
  selections: z.record(categoryKeySchema, buildSelectionSchema),
});

export const compatibilityOptionResultSchema = z.object({
  product: productSummarySchema,
  status: compatibilityStatusSchema,
  reasons: z.array(z.string().min(1)),
});

export const compatibilityOptionsRequestSchema = z.object({
  targetCategory: categoryKeySchema,
  selections: z.record(categoryKeySchema, buildSelectionSchema),
  filters: z.record(z.string(), z.unknown()).optional(),
  search: z.string().optional(),
});

export const compatibilityOptionsResponseSchema = z.object({
  targetCategory: categoryKeySchema,
  compatible: z.array(compatibilityOptionResultSchema),
  warning: z.array(compatibilityOptionResultSchema),
  incompatible: z.array(compatibilityOptionResultSchema),
});

export type RuleOperator = z.infer<typeof ruleOperatorSchema>;
export type CompatibilityStatus = z.infer<typeof compatibilityStatusSchema>;
export type BuildValidationStatus = z.infer<typeof buildValidationStatusSchema>;
export type BuildSelection = z.infer<typeof buildSelectionSchema>;
export type CompatibilityIssue = z.infer<typeof compatibilityIssueSchema>;
export type CompatibilityCheckResult = z.infer<typeof compatibilityCheckResultSchema>;
export type CompatibilityEvaluation = z.infer<typeof compatibilityEvaluationSchema>;
export type CompatibilityOptionResult = z.infer<typeof compatibilityOptionResultSchema>;
