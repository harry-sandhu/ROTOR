import {
  normalizeSpecificationValue,
  validateSpecificationValue,
  type SpecificationValidationIssue,
} from "@rotor/domain";
import type { DbClient } from "@rotor/db";

import { notFound } from "../../lib/errors.js";
import { evaluateBuildCompatibility } from "../compatibility/service.js";
import { getActiveProductsByIds, getCategoryValidationMetadata, getRuleValidationMetadata } from "./repository.js";

function dedupeIssues(issues: SpecificationValidationIssue[]) {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.field}:${issue.message}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function validateProductSpecifications(
  db: DbClient,
  input: { categoryKey: string; specs: Record<string, unknown> },
) {
  const metadata = await getCategoryValidationMetadata(db, input.categoryKey);

  if (metadata.length === 0) {
    throw notFound("CATEGORY_NOT_FOUND", `No validation metadata found for category ${input.categoryKey}.`);
  }

  const issues: SpecificationValidationIssue[] = [];
  const specKeys = new Set(metadata.map((item) => item.specificationKey));

  for (const item of metadata) {
    const value = input.specs[item.specificationKey];

    if (item.isRequired && value === undefined) {
      issues.push({
        field: `specs.${item.specificationKey}`,
        message: `Specification ${item.specificationName} is required.`,
      });
      continue;
    }

    if (value !== undefined) {
      issues.push(
        ...validateSpecificationValue(
          {
            key: item.specificationKey,
            dataType: item.dataType,
            validation: item.validation,
            unit: item.unit,
          },
          value,
        ),
      );

      normalizeSpecificationValue({
        dataType: item.dataType,
        unit: item.unit,
        value,
      });
    }
  }

  for (const key of Object.keys(input.specs)) {
    if (!specKeys.has(key)) {
      issues.push({
        field: `specs.${key}`,
        message: `Specification ${key} is not assigned to category ${input.categoryKey}.`,
      });
    }
  }

  const normalizedIssues = dedupeIssues(issues);

  return {
    isValid: normalizedIssues.length === 0,
    issues: normalizedIssues,
  };
}

export async function validateBuildSelections(
  db: DbClient,
  input: { selections: Record<string, { productId: string; quantity: number }> },
) {
  const productIds = Object.values(input.selections).map((selection) => selection.productId);
  const products = await getActiveProductsByIds(db, productIds);
  const issues: SpecificationValidationIssue[] = [];

  for (const [categoryKey, selection] of Object.entries(input.selections)) {
    const product = products.find((candidate) => candidate.id === selection.productId);

    if (!product) {
      issues.push({
        field: `selections.${categoryKey}.productId`,
        message: `Product ${selection.productId} does not exist or is not active.`,
      });
      continue;
    }

    if (product.categoryKey !== categoryKey) {
      issues.push({
        field: `selections.${categoryKey}.productId`,
        message: `Product ${selection.productId} belongs to category ${product.categoryKey}, not ${categoryKey}.`,
      });
    }
  }

  let buildIsValid = issues.length === 0;

  if (issues.length === 0) {
    const evaluation = await evaluateBuildCompatibility(db, input.selections);
    issues.push(
      ...evaluation.issues.map((issue) => ({
        field: issue.status === "INCOMPATIBLE" ? "compatibility" : "warnings",
        message: issue.message,
      })),
    );
    buildIsValid = evaluation.overallStatus !== "INCOMPATIBLE";
  }

  const normalizedIssues = dedupeIssues(issues);

  return {
    isValid: buildIsValid,
    issues: normalizedIssues,
  };
}

export async function validateRuleReferences(
  db: DbClient,
  input: {
    fromCategoryKey: string;
    toCategoryKey: string;
    leftSpecificationKey: string;
    rightSpecificationKey: string;
  },
) {
  const metadata = await getRuleValidationMetadata(db, input);
  const lookup = new Set(metadata.map((item) => `${item.categoryKey}:${item.specificationKey}`));
  const issues: SpecificationValidationIssue[] = [];

  if (!lookup.has(`${input.fromCategoryKey}:${input.leftSpecificationKey}`)) {
    issues.push({
      field: "leftSpecificationKey",
      message: `Specification ${input.leftSpecificationKey} is not assigned to category ${input.fromCategoryKey}.`,
    });
  }

  if (!lookup.has(`${input.toCategoryKey}:${input.rightSpecificationKey}`)) {
    issues.push({
      field: "rightSpecificationKey",
      message: `Specification ${input.rightSpecificationKey} is not assigned to category ${input.toCategoryKey}.`,
    });
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
