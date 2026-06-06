import type { SearchSuggestionsResponse } from "@rotor/contracts";
import type { DbClient } from "@rotor/db";
import { deriveSearchMetadata } from "@rotor/domain";

import { findSearchSuggestions } from "./repository.js";
import { listCatalogProducts } from "../products/service.js";

function buildSearchQuery(input: {
  q: string;
  category?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}) {
  const metadata = deriveSearchMetadata(input.q);
  const derivedCategory = input.category ?? metadata.category;
  const rawQuery: Record<string, unknown> = {
    search: input.q,
  };

  if (typeof input.page === "number") {
    rawQuery.page = input.page;
  }

  if (typeof input.pageSize === "number") {
    rawQuery.pageSize = input.pageSize;
  }

  if (derivedCategory) {
    rawQuery.category = derivedCategory;
  }

  for (const token of metadata.tokens) {
    if (token.type === "kv") {
      rawQuery["spec.kv"] = token.value;
    }

    if (token.type === "cellCount") {
      rawQuery["spec.cellCount"] = token.value;
    }

    if (token.type === "stackMount") {
      rawQuery["spec.stackMount"] = token.value;
    }

    if (token.type === "propSize") {
      if (derivedCategory === "FRAME") {
        rawQuery["spec.maxPropSize"] = token.value;
      } else if (derivedCategory === "MOTOR") {
        rawQuery["spec.recommendedPropSize"] = token.value;
      } else if (derivedCategory === "PROPELLER") {
        rawQuery["spec.size"] = token.value;
      }
    }
  }

  return { rawQuery, metadata };
}

export async function searchProducts(
  db: DbClient,
  input: { q: string; category?: string | undefined; page?: number | undefined; pageSize?: number | undefined },
) {
  const { rawQuery } = buildSearchQuery(input);
  return listCatalogProducts(db, rawQuery);
}

export async function getSearchSuggestions(db: DbClient, query: string): Promise<SearchSuggestionsResponse> {
  const { rawQuery, metadata } = buildSearchQuery({ q: query, page: 1, pageSize: 5 });
  const [suggestions, previewResults] = await Promise.all([
    findSearchSuggestions(db, query),
    listCatalogProducts(db, rawQuery),
  ]);

  return {
    query,
    suggestions: [
      ...suggestions.products.map((value) => ({ value, type: "PRODUCT" as const })),
      ...suggestions.brands.map((value) => ({ value, type: "BRAND" as const })),
      ...suggestions.categories.map((value) => ({ value, type: "CATEGORY" as const })),
      ...metadata.tokens
        .filter((token) => token.type !== "freeText")
        .map((token) => ({ value: token.value, type: "SPEC_TOKEN" as const })),
    ],
    previewProducts: previewResults.items.slice(0, 5),
  };
}
