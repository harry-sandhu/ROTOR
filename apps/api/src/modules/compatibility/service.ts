import { evaluateCompatibility, normalizeSpecificationValue, type CompatibilityProductInput } from "@rotor/domain";
import type { DbClient } from "@rotor/db";

import { badRequest } from "../../lib/errors.js";
import { getCompatibilityRulesForCategories, getActiveProductsByIds, getSpecificationsForProducts } from "./repository.js";

function parseSpecificationValue(row: {
  dataType: string;
  unit: string | null;
  numericValue: string | null;
  textValue: string | null;
  booleanValue: boolean | null;
  rangeMin: string | null;
  rangeMax: string | null;
  jsonValue: unknown;
  normalizedLabel: string | null;
}) {
  if (row.dataType === "NUMBER") {
    return normalizeSpecificationValue({
      dataType: "NUMBER",
      unit: row.unit,
      value: row.numericValue === null ? null : Number(row.numericValue),
    });
  }

  if (row.dataType === "TEXT" || row.dataType === "ENUM") {
    return normalizeSpecificationValue({
      dataType: row.dataType,
      unit: row.unit,
      value: row.textValue,
    });
  }

  if (row.dataType === "BOOLEAN") {
    return normalizeSpecificationValue({
      dataType: "BOOLEAN",
      unit: row.unit,
      value: row.booleanValue,
    });
  }

  if (row.dataType === "RANGE") {
    return normalizeSpecificationValue({
      dataType: "RANGE",
      unit: row.unit,
      value:
        row.rangeMin !== null && row.rangeMax !== null
          ? { min: Number(row.rangeMin), max: Number(row.rangeMax) }
          : null,
    });
  }

  if (row.dataType === "ARRAY") {
    return normalizeSpecificationValue({
      dataType: "ARRAY",
      unit: row.unit,
      value: row.jsonValue,
    });
  }

  return normalizeSpecificationValue({
    dataType: "JSON",
    unit: row.unit,
    value: row.jsonValue,
  });
}

function buildCompatibilityProducts(input: {
  products: Array<{
    id: string;
    categoryKey: string;
    priceCents: number;
  }>;
  specifications: Array<{
    productId: string;
    specificationKey: string;
    dataType: string;
    unit: string | null;
    numericValue: string | null;
    textValue: string | null;
    booleanValue: boolean | null;
    rangeMin: string | null;
    rangeMax: string | null;
    jsonValue: unknown;
    normalizedLabel: string | null;
  }>;
  selections: Record<string, { productId: string; quantity: number }>;
}): Partial<Record<string, CompatibilityProductInput>> {
  const specsByProductId = input.specifications.reduce<Record<string, CompatibilityProductInput["specs"]>>((accumulator, spec) => {
    const current = accumulator[spec.productId] ?? {};
    const normalized = parseSpecificationValue(spec);
    current[spec.specificationKey] = {
      value: normalized.value,
      normalizedLabel: spec.normalizedLabel ?? normalized.normalizedLabel,
    };
    accumulator[spec.productId] = current;
    return accumulator;
  }, {});

  return input.products.reduce<Partial<Record<string, CompatibilityProductInput>>>((accumulator, product) => {
    const selectionEntry = Object.entries(input.selections).find(([, selection]) => selection.productId === product.id);
    const categoryKey = selectionEntry?.[0] ?? product.categoryKey;
    const quantity = selectionEntry?.[1].quantity ?? 1;

    accumulator[categoryKey] = {
      id: product.id,
      category: categoryKey,
      priceCents: product.priceCents,
      quantity,
      specs: specsByProductId[product.id] ?? {},
    };

    return accumulator;
  }, {});
}

export async function evaluateBuildCompatibility(
  db: DbClient,
  selections: Record<string, { productId: string; quantity: number }>,
) {
  const productIds = Object.values(selections).map((selection) => selection.productId);
  const [products, specifications] = await Promise.all([
    getActiveProductsByIds(db, productIds),
    getSpecificationsForProducts(db, productIds),
  ]);

  if (products.length !== productIds.length) {
    throw badRequest("BUILD_PRODUCTS_NOT_FOUND", "One or more selected products do not exist or are not active.");
  }

  for (const [categoryKey, selection] of Object.entries(selections)) {
    const product = products.find((candidate) => candidate.id === selection.productId);

    if (!product) {
      throw badRequest("BUILD_PRODUCTS_NOT_FOUND", `Product ${selection.productId} was not found.`);
    }

    if (product.categoryKey !== categoryKey) {
      throw badRequest(
        "CATEGORY_MISMATCH",
        `Product ${selection.productId} belongs to ${product.categoryKey}, not ${categoryKey}.`,
      );
    }
  }

  const categories = products.map((product) => product.categoryKey);
  const rules = await getCompatibilityRulesForCategories(db, categories);

  return evaluateCompatibility({
    productsByCategory: buildCompatibilityProducts({
      products,
      specifications,
      selections,
    }),
    rules: rules.map((rule) => ({
      key: rule.key,
      fromCategory: rule.fromCategoryKey,
      toCategory: rule.toCategoryKey,
      leftSpecificationKey: rule.leftSpecificationKey,
      rightSpecificationKey: rule.rightSpecificationKey,
      operator: rule.operator,
      severityOnFail: rule.severityOnFail,
      successMessageTemplate: rule.successMessageTemplate,
      failureMessageTemplate: rule.failureMessageTemplate,
      warningThreshold: rule.warningThresholdJson,
    })),
  });
}
