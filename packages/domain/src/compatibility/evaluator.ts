import type { CategoryKey } from "../categories.js";
import type { SpecificationValue } from "../specifications.js";
import { createMissingDataResult } from "./missing-data.js";
import { renderRuleMessage } from "./explanation.js";
import { evaluateRuleOperator } from "./operators.js";
import { buildCompatibilitySummary } from "./scoring.js";
import { evaluateThresholdWarning } from "./thresholds.js";
import type { CompatibilityEvaluation, CompatibilityIssue, RuleFailureSeverity, RuleOperator } from "./types.js";

export interface CompatibilityRuleInput {
  key: string;
  fromCategory: CategoryKey;
  toCategory: CategoryKey;
  leftSpecificationKey: string;
  rightSpecificationKey: string;
  operator: RuleOperator;
  severityOnFail: RuleFailureSeverity;
  successMessageTemplate?: string | null;
  failureMessageTemplate: string;
  warningThreshold?: Record<string, unknown> | null;
}

export interface CompatibilityProductInput {
  id: string;
  category: CategoryKey;
  priceCents: number;
  quantity: number;
  specs: Record<string, { value: SpecificationValue; normalizedLabel: string | null }>;
}

export interface CompatibilityEvaluationInput {
  productsByCategory: Partial<Record<CategoryKey, CompatibilityProductInput>>;
  rules: CompatibilityRuleInput[];
}

function toIssueCode(ruleKey: string): string {
  return ruleKey.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
}

export function evaluateCompatibility(input: CompatibilityEvaluationInput): CompatibilityEvaluation {
  const checks: CompatibilityEvaluation["checks"] = [];
  const issues: CompatibilityIssue[] = [];
  const selectedCategories = Object.keys(input.productsByCategory) as CategoryKey[];
  const totalCostCents = Object.values(input.productsByCategory).reduce((sum, product) => {
    if (!product) {
      return sum;
    }

    return sum + product.priceCents * product.quantity;
  }, 0);

  for (const rule of input.rules) {
    const fromProduct = input.productsByCategory[rule.fromCategory];
    const toProduct = input.productsByCategory[rule.toCategory];

    if (!fromProduct || !toProduct) {
      continue;
    }

    const leftSpec = fromProduct.specs[rule.leftSpecificationKey];
    const rightSpec = toProduct.specs[rule.rightSpecificationKey];

    if (!leftSpec || !rightSpec) {
      const missingData = createMissingDataResult({
        ruleKey: rule.key,
        fromCategory: rule.fromCategory,
        toCategory: rule.toCategory,
        leftSpec: rule.leftSpecificationKey,
        rightSpec: rule.rightSpecificationKey,
        leftProductId: fromProduct.id,
        rightProductId: toProduct.id,
      });

      checks.push(missingData.check);
      issues.push(missingData.issue);
      continue;
    }

    const isCompatible = evaluateRuleOperator(rule.operator, leftSpec.value, rightSpec.value);

    if (!isCompatible) {
      const message = renderRuleMessage(rule.failureMessageTemplate, {
        fromCategory: rule.fromCategory,
        toCategory: rule.toCategory,
        leftSpec: rule.leftSpecificationKey,
        rightSpec: rule.rightSpecificationKey,
        leftValue: leftSpec.value,
        rightValue: rightSpec.value,
      });
      const status = rule.severityOnFail;

      checks.push({
        ruleKey: rule.key,
        fromCategory: rule.fromCategory,
        toCategory: rule.toCategory,
        status,
        message,
        leftValue: leftSpec.value,
        rightValue: rightSpec.value,
      });
      issues.push({
        status,
        code: toIssueCode(rule.key),
        message,
        categories: [rule.fromCategory, rule.toCategory],
        productIds: [fromProduct.id, toProduct.id],
        ruleKey: rule.key,
      });
      continue;
    }

    const thresholdWarning = evaluateThresholdWarning({
      ruleKey: rule.key,
      leftValue: leftSpec.value,
      rightValue: rightSpec.value,
      warningThreshold: rule.warningThreshold,
    });

    if (thresholdWarning) {
      checks.push({
        ruleKey: rule.key,
        fromCategory: rule.fromCategory,
        toCategory: rule.toCategory,
        status: "WARNING",
        message: thresholdWarning.message,
        leftValue: leftSpec.value,
        rightValue: rightSpec.value,
      });
      issues.push({
        status: "WARNING",
        code: thresholdWarning.code,
        message: thresholdWarning.message,
        categories: [rule.fromCategory, rule.toCategory],
        productIds: [fromProduct.id, toProduct.id],
        ruleKey: rule.key,
      });
      continue;
    }

    checks.push({
      ruleKey: rule.key,
      fromCategory: rule.fromCategory,
      toCategory: rule.toCategory,
      status: "COMPATIBLE",
      message:
        rule.successMessageTemplate ??
        `${rule.leftSpecificationKey} is compatible with ${rule.rightSpecificationKey}.`,
      leftValue: leftSpec.value,
      rightValue: rightSpec.value,
    });
  }

  const hardRuleKeys = input.rules
    .filter((rule) => rule.severityOnFail === "INCOMPATIBLE")
    .map((rule) => rule.key);

  return buildCompatibilitySummary({
    selectedCategories,
    totalCostCents,
    issues,
    checks,
    hardRuleKeys,
  });
}
