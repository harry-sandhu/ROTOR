import type { CompatibilityCheckResult, CompatibilityIssue } from "./types.js";

export function createMissingDataResult(input: {
  ruleKey: string;
  fromCategory: string;
  toCategory: string;
  leftSpec: string;
  rightSpec: string;
  leftProductId?: string;
  rightProductId?: string;
}): { check: CompatibilityCheckResult; issue: CompatibilityIssue } {
  const message = `Missing specification data for ${input.leftSpec} or ${input.rightSpec}.`;

  return {
    check: {
      ruleKey: input.ruleKey,
      fromCategory: input.fromCategory,
      toCategory: input.toCategory,
      status: "WARNING",
      message,
      leftValue: null,
      rightValue: null,
    },
    issue: {
      status: "WARNING",
      code: "MISSING_SPEC_DATA",
      message,
      categories: [input.fromCategory, input.toCategory],
      productIds: [input.leftProductId, input.rightProductId].filter((value): value is string => Boolean(value)),
      ruleKey: input.ruleKey,
    },
  };
}
