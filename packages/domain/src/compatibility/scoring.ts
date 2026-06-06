import { mvpCategoryKeys, type CategoryKey } from "../categories.js";
import type { CompatibilityCheckResult, CompatibilityEvaluation, CompatibilityIssue, CompatibilityStatus, BuildValidationStatus } from "./types.js";

function deriveOverallStatus(issues: CompatibilityIssue[]): CompatibilityStatus {
  if (issues.some((issue) => issue.status === "INCOMPATIBLE")) {
    return "INCOMPATIBLE";
  }

  if (issues.some((issue) => issue.status === "WARNING")) {
    return "WARNING";
  }

  return "COMPATIBLE";
}

function deriveValidationStatus(missingCategories: CategoryKey[], issues: CompatibilityIssue[]): BuildValidationStatus {
  if (issues.some((issue) => issue.status === "INCOMPATIBLE")) {
    return "INVALID";
  }

  if (missingCategories.length > 0) {
    return "INCOMPLETE";
  }

  if (issues.some((issue) => issue.status === "WARNING")) {
    return "VALID_WITH_WARNINGS";
  }

  return "VALID";
}

export function calculateCompatibilityScore(input: {
  selectedCategories: CategoryKey[];
  checks: CompatibilityCheckResult[];
  issues: CompatibilityIssue[];
  hardRuleKeys: string[];
}): number {
  const completenessRatio = input.selectedCategories.length / mvpCategoryKeys.length;

  const hardChecks = input.checks.filter((check) => input.hardRuleKeys.includes(check.ruleKey));
  const hardRulePassRatio =
    hardChecks.length === 0
      ? 1
      : hardChecks.filter((check) => check.status !== "INCOMPATIBLE").length / hardChecks.length;

  const warningPenalty = Math.min(input.issues.filter((issue) => issue.status === "WARNING").length * 4, 20);

  return Math.max(0, Math.min(100, Math.round(completenessRatio * 40 + hardRulePassRatio * 60 - warningPenalty)));
}

export function buildCompatibilitySummary(input: {
  selectedCategories: CategoryKey[];
  totalCostCents: number;
  issues: CompatibilityIssue[];
  checks: CompatibilityCheckResult[];
  hardRuleKeys: string[];
}): Pick<CompatibilityEvaluation, "overallStatus" | "validationStatus" | "score" | "missingCategories" | "totalCostCents" | "issues" | "checks"> {
  const missingCategories = mvpCategoryKeys.filter((category) => !input.selectedCategories.includes(category));
  const overallStatus = deriveOverallStatus(input.issues);
  const validationStatus = deriveValidationStatus(missingCategories, input.issues);
  const score = calculateCompatibilityScore({
    selectedCategories: input.selectedCategories,
    checks: input.checks,
    issues: input.issues,
    hardRuleKeys: input.hardRuleKeys,
  });

  return {
    overallStatus,
    validationStatus,
    score,
    missingCategories,
    totalCostCents: input.totalCostCents,
    issues: input.issues,
    checks: input.checks,
  };
}
