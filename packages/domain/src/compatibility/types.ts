import type { CategoryKey } from "../categories.js";

export const ruleOperatorValues = ["EQ", "NEQ", "GTE", "LTE", "RANGE_CONTAINS", "RANGE_OVERLAPS", "ARRAY_CONTAINS", "ARRAY_OVERLAPS"] as const;
export const compatibilityStatusValues = ["COMPATIBLE", "WARNING", "INCOMPATIBLE"] as const;
export const buildValidationStatusValues = ["INCOMPLETE", "VALID", "VALID_WITH_WARNINGS", "INVALID"] as const;
export const ruleFailureSeverityValues = ["WARNING", "INCOMPATIBLE"] as const;

export type RuleOperator = (typeof ruleOperatorValues)[number];
export type CompatibilityStatus = (typeof compatibilityStatusValues)[number];
export type BuildValidationStatus = (typeof buildValidationStatusValues)[number];
export type RuleFailureSeverity = (typeof ruleFailureSeverityValues)[number];

export interface CompatibilityIssue {
  status: Extract<CompatibilityStatus, "WARNING" | "INCOMPATIBLE">;
  code: string;
  message: string;
  categories: CategoryKey[];
  productIds: string[];
  ruleKey?: string;
}

export interface CompatibilityCheckResult {
  ruleKey: string;
  fromCategory: CategoryKey;
  toCategory: CategoryKey;
  status: CompatibilityStatus;
  message: string;
  leftValue: unknown;
  rightValue: unknown;
}

export interface CompatibilityEvaluation {
  overallStatus: CompatibilityStatus;
  validationStatus: BuildValidationStatus;
  score: number;
  totalCostCents: number;
  missingCategories: CategoryKey[];
  issues: CompatibilityIssue[];
  checks: CompatibilityCheckResult[];
}
