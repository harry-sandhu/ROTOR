import type { ProductDetail, ProductSummary } from "@rotor/contracts";
import type { DbClient } from "@rotor/db";

import { createPaginationMeta, resolvePagination } from "../../lib/pagination.js";
import { notFound } from "../../lib/errors.js";
import { mapProductDetail, mapProductSummary } from "./mapper.js";
import {
  countProducts,
  findProductIdsBySpecFilters,
  getProductById,
  getProductBySlug,
  getProductImages,
  getProductSpecifications,
  getProductSummarySpecs,
  listAlternativeProducts,
  listProducts,
  type ProductSpecFilter,
} from "./repository.js";

function extractSpecFilters(rawQuery: Record<string, unknown>): ProductSpecFilter[] {
  return Object.entries(rawQuery)
    .filter(([key, value]) => key.startsWith("spec.") && typeof value === "string" && value.length > 0)
    .map(([key, value]) => {
      const segments = key.split(".");
      const specificationKey = segments[1] ?? "";
      const operator: ProductSpecFilter["operator"] =
        segments[2] === "min" || segments[2] === "max" ? segments[2] : "eq";
      const normalizedValue = String(value);

      return {
        specificationKey,
        operator,
        value: normalizedValue,
      };
    })
    .filter((filter) => filter.specificationKey.length > 0);
}

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as {
    [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>;
  };
}

function groupSummarySpecs(summarySpecs: Array<{ productId: string; specificationKey: string; label: string; value: string | null }>) {
  return summarySpecs.reduce<Record<string, Array<{ specificationKey: string; label: string; value: string | null }>>>((accumulator, spec) => {
    const current = accumulator[spec.productId] ?? [];
    current.push({
      specificationKey: spec.specificationKey,
      label: spec.label,
      value: spec.value,
    });
    accumulator[spec.productId] = current;
    return accumulator;
  }, {});
}

async function mapAlternativeProducts(db: DbClient, categoryKey: string, excludeProductId: string): Promise<ProductSummary[]> {
  const alternatives = await listAlternativeProducts(db, categoryKey, excludeProductId);
  const alternativeSummarySpecs = await getProductSummarySpecs(
    db,
    alternatives.map((alternative) => alternative.id),
  );
  const groupedAlternativeSpecs = groupSummarySpecs(alternativeSummarySpecs);

  return alternatives.map((alternative: (typeof alternatives)[number]) =>
    mapProductSummary(alternative, groupedAlternativeSpecs[alternative.id] ?? []),
  );
}

export async function listCatalogProducts(db: DbClient, rawQuery: Record<string, unknown>) {
  const specFilters = extractSpecFilters(rawQuery);
  const filteredProductIds = await findProductIdsBySpecFilters(db, specFilters);
  const pagination = resolvePagination(
    omitUndefined({
      page: typeof rawQuery.page === "number" ? rawQuery.page : undefined,
      pageSize: typeof rawQuery.pageSize === "number" ? rawQuery.pageSize : undefined,
    }),
  );

  const filters = omitUndefined({
    category: typeof rawQuery.category === "string" ? rawQuery.category : undefined,
    brand: typeof rawQuery.brand === "string" ? rawQuery.brand : undefined,
    status: typeof rawQuery.status === "string" ? (rawQuery.status as "DRAFT" | "ACTIVE" | "ARCHIVED") : undefined,
    minPrice: typeof rawQuery.minPrice === "number" ? rawQuery.minPrice : undefined,
    maxPrice: typeof rawQuery.maxPrice === "number" ? rawQuery.maxPrice : undefined,
    search: typeof rawQuery.search === "string" ? rawQuery.search : undefined,
    inStock: typeof rawQuery.inStock === "boolean" ? rawQuery.inStock : undefined,
    productIds: filteredProductIds ?? undefined,
  });

  const [items, total] = await Promise.all([
    listProducts(db, filters, pagination),
    countProducts(db, filters),
  ]);

  const summarySpecs = await getProductSummarySpecs(
    db,
    items.map((item: (typeof items)[number]) => item.id),
  );
  const groupedSummarySpecs = groupSummarySpecs(summarySpecs);

  return {
    items: items.map((item: (typeof items)[number]) => mapProductSummary(item, groupedSummarySpecs[item.id] ?? [])),
    pagination: createPaginationMeta(pagination.page, pagination.pageSize, total),
  };
}

async function getProductDetailByBaseProduct(
  db: DbClient,
  product: NonNullable<Awaited<ReturnType<typeof getProductById>>>,
): Promise<ProductDetail> {
  const [summarySpecs, images, specifications, alternativeProducts] = await Promise.all([
    getProductSummarySpecs(db, [product.id]),
    getProductImages(db, product.id),
    getProductSpecifications(db, product.id),
    mapAlternativeProducts(db, product.categoryKey, product.id),
  ]);

  const groupedSummarySpecs = groupSummarySpecs(summarySpecs);

  return mapProductDetail({
    product,
    summarySpecs: groupedSummarySpecs[product.id] ?? [],
    images,
    specifications,
    alternativeProducts,
  });
}

export async function getCatalogProductById(db: DbClient, productId: string) {
  const product = await getProductById(db, productId);

  if (!product) {
    throw notFound("PRODUCT_NOT_FOUND", `Product ${productId} was not found.`);
  }

  return getProductDetailByBaseProduct(db, product);
}

export async function getCatalogProductBySlug(db: DbClient, slug: string) {
  const product = await getProductBySlug(db, slug);

  if (!product) {
    throw notFound("PRODUCT_NOT_FOUND", `Product ${slug} was not found.`);
  }

  return getProductDetailByBaseProduct(db, product);
}
