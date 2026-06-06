import type { CompatibilityOptionResult } from "@rotor/contracts";
import { deriveCandidateStatus } from "@rotor/domain";
import type { DbClient } from "@rotor/db";

import { mapProductSummary } from "../products/mapper.js";
import { getProductSummarySpecs, listProducts, findProductIdsBySpecFilters, type ProductSpecFilter } from "../products/repository.js";
import { evaluateBuildCompatibility } from "./service.js";

function buildOptionFilters(input: {
  targetCategory: string;
  filters?: Record<string, unknown> | undefined;
  search?: string | undefined;
}) {
  const filters = input.filters ?? {};
  const specFilters: ProductSpecFilter[] = [];

  if (filters.spec && typeof filters.spec === "object" && filters.spec !== null) {
    for (const [key, value] of Object.entries(filters.spec as Record<string, unknown>)) {
      if (typeof value === "string" || typeof value === "number") {
        specFilters.push({
          specificationKey: key,
          operator: "eq",
          value: String(value),
        });
      }
    }
  }

  return {
    baseFilters: {
      category: input.targetCategory,
      brand: typeof filters.brand === "string" ? filters.brand : undefined,
      minPrice: typeof filters.minPrice === "number" ? filters.minPrice : undefined,
      maxPrice: typeof filters.maxPrice === "number" ? filters.maxPrice : undefined,
      inStock: typeof filters.inStock === "boolean" ? filters.inStock : undefined,
      search: input.search,
    },
    specFilters,
  };
}

export async function getCompatibleOptions(
  db: DbClient,
  input: {
    targetCategory: string;
    selections: Record<string, { productId: string; quantity: number }>;
    filters?: Record<string, unknown> | undefined;
    search?: string | undefined;
  },
) {
  const { baseFilters, specFilters } = buildOptionFilters(input);
  const filteredProductIds = await findProductIdsBySpecFilters(db, specFilters);
  const productFilters: import("../products/repository.js").ProductListFilters = {
    category: input.targetCategory,
  };

  if (typeof baseFilters.brand === "string") {
    productFilters.brand = baseFilters.brand;
  }

  if (typeof baseFilters.minPrice === "number") {
    productFilters.minPrice = baseFilters.minPrice;
  }

  if (typeof baseFilters.maxPrice === "number") {
    productFilters.maxPrice = baseFilters.maxPrice;
  }

  if (typeof baseFilters.inStock === "boolean") {
    productFilters.inStock = baseFilters.inStock;
  }

  if (typeof baseFilters.search === "string") {
    productFilters.search = baseFilters.search;
  }

  if (filteredProductIds !== null) {
    productFilters.productIds = filteredProductIds;
  }

  const candidates = await listProducts(db, productFilters, { offset: 0, pageSize: 100 });
  const summarySpecs = await getProductSummarySpecs(
    db,
    candidates.map((candidate) => candidate.id),
  );
  const groupedSummarySpecs = summarySpecs.reduce<Record<string, Array<{ specificationKey: string; label: string; value: string | null }>>>((accumulator, spec) => {
    const current = accumulator[spec.productId] ?? [];
    current.push({
      specificationKey: spec.specificationKey,
      label: spec.label,
      value: spec.value,
    });
    accumulator[spec.productId] = current;
    return accumulator;
  }, {});

  const candidateSummaries = candidates.map((candidate) => ({
    base: candidate,
    summary: mapProductSummary(candidate, groupedSummarySpecs[candidate.id] ?? []),
  }));

  const results: { compatible: CompatibilityOptionResult[]; warning: CompatibilityOptionResult[]; incompatible: CompatibilityOptionResult[] } = {
    compatible: [],
    warning: [],
    incompatible: [],
  };

  for (const candidate of candidateSummaries) {
    const evaluation = await evaluateBuildCompatibility(db, {
      ...input.selections,
      [input.targetCategory]: {
        productId: candidate.base.id,
        quantity: input.targetCategory === "MOTOR" || input.targetCategory === "PROPELLER" ? 4 : 1,
      },
    });

    const status = deriveCandidateStatus(evaluation, input.targetCategory);
    const optionResult: CompatibilityOptionResult = {
      product: candidate.summary,
      status: status.status,
      reasons: status.reasons,
    };

    if (status.status === "INCOMPATIBLE") {
      results.incompatible.push(optionResult);
    } else if (status.status === "WARNING") {
      results.warning.push(optionResult);
    } else {
      results.compatible.push(optionResult);
    }
  }

  return {
    targetCategory: input.targetCategory,
    compatible: results.compatible,
    warning: results.warning,
    incompatible: results.incompatible,
  };
}
