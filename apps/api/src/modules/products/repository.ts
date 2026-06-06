import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";

import {
  categories,
  categorySpecifications,
  productImages,
  products,
  productSpecValues,
  specificationDefinitions,
  type DbClient,
  type ProductStatus,
} from "@rotor/db";

export interface ProductListFilters {
  category?: string;
  brand?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  productIds?: string[];
}

export interface ProductSpecFilter {
  specificationKey: string;
  operator: "eq" | "min" | "max";
  value: string;
}

function buildProductWhere(filters: ProductListFilters) {
  const conditions = [];

  conditions.push(eq(products.status, filters.status ?? "ACTIVE"));

  if (filters.category) {
    conditions.push(eq(products.categoryKey, filters.category));
  }

  if (filters.brand) {
    conditions.push(eq(products.brand, filters.brand));
  }

  if (typeof filters.minPrice === "number") {
    conditions.push(gte(products.priceCents, filters.minPrice));
  }

  if (typeof filters.maxPrice === "number") {
    conditions.push(lte(products.priceCents, filters.maxPrice));
  }

  if (filters.inStock) {
    conditions.push(gte(products.stockQuantity, 1));
  }

  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(products.name, searchPattern),
        ilike(products.brand, searchPattern),
        ilike(products.slug, searchPattern),
      )!,
    );
  }

  if (filters.productIds) {
    if (filters.productIds.length === 0) {
      conditions.push(sql`1 = 0`);
    } else {
      conditions.push(inArray(products.id, filters.productIds));
    }
  }

  return and(...conditions);
}

export async function findProductIdsBySpecFilters(db: DbClient, filters: ProductSpecFilter[]) {
  if (filters.length === 0) {
    return null;
  }

  let intersection: Set<string> | null = null;

  for (const filter of filters) {
    const numericValue = Number(filter.value);
    const hasNumericValue = Number.isFinite(numericValue);

    const valueCondition =
      filter.operator === "min"
        ? gte(productSpecValues.numericValue, numericValue.toString())
        : filter.operator === "max"
          ? lte(productSpecValues.numericValue, numericValue.toString())
          : hasNumericValue
            ? or(
                eq(productSpecValues.numericValue, numericValue.toString()),
                eq(productSpecValues.textValue, filter.value),
                eq(productSpecValues.normalizedLabel, filter.value),
              )
            : or(eq(productSpecValues.textValue, filter.value), eq(productSpecValues.normalizedLabel, filter.value));

    const rows = await db
      .select({ productId: productSpecValues.productId })
      .from(productSpecValues)
      .innerJoin(
        specificationDefinitions,
        eq(productSpecValues.specificationId, specificationDefinitions.id),
      )
      .where(and(eq(specificationDefinitions.key, filter.specificationKey), valueCondition!));

    const productIds = new Set<string>(rows.map((row: (typeof rows)[number]) => row.productId));

    if (intersection) {
      const nextIntersection = new Set<string>();

      for (const productId of intersection) {
        if (productIds.has(productId)) {
          nextIntersection.add(productId);
        }
      }

      intersection = nextIntersection;
    } else {
      intersection = productIds;
    }
  }

  return intersection ? [...intersection] : [];
}

export async function countProducts(db: DbClient, filters: ProductListFilters) {
  const whereClause = buildProductWhere(filters);
  const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(products).where(whereClause);

  return result?.count ?? 0;
}

export async function listProducts(
  db: DbClient,
  filters: ProductListFilters,
  pagination: { offset: number; pageSize: number },
) {
  const whereClause = buildProductWhere(filters);

  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      brand: products.brand,
      categoryKey: products.categoryKey,
      priceCents: products.priceCents,
      stockQuantity: products.stockQuantity,
      status: products.status,
      thumbnailUrl: products.thumbnailUrl,
      description: products.description,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(whereClause)
    .orderBy(asc(products.categoryKey), asc(products.brand), asc(products.name))
    .limit(pagination.pageSize)
    .offset(pagination.offset);
}

export async function getProductById(db: DbClient, productId: string) {
  const [product] = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      brand: products.brand,
      categoryKey: products.categoryKey,
      priceCents: products.priceCents,
      stockQuantity: products.stockQuantity,
      status: products.status,
      thumbnailUrl: products.thumbnailUrl,
      description: products.description,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.status, "ACTIVE")));

  return product;
}

export async function getProductBySlug(db: DbClient, slug: string) {
  const [product] = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      brand: products.brand,
      categoryKey: products.categoryKey,
      priceCents: products.priceCents,
      stockQuantity: products.stockQuantity,
      status: products.status,
      thumbnailUrl: products.thumbnailUrl,
      description: products.description,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "ACTIVE")));

  return product;
}

export async function getProductSummarySpecs(db: DbClient, productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return db
    .select({
      productId: productSpecValues.productId,
      specificationKey: specificationDefinitions.key,
      label: specificationDefinitions.name,
      value: productSpecValues.normalizedLabel,
      sortOrder: categorySpecifications.sortOrder,
    })
    .from(productSpecValues)
    .innerJoin(
      specificationDefinitions,
      eq(productSpecValues.specificationId, specificationDefinitions.id),
    )
    .innerJoin(products, eq(productSpecValues.productId, products.id))
    .innerJoin(
      categorySpecifications,
      and(
        eq(categorySpecifications.categoryKey, products.categoryKey),
        eq(categorySpecifications.specificationId, specificationDefinitions.id),
      ),
    )
    .where(and(inArray(productSpecValues.productId, productIds), eq(categorySpecifications.isVisibleOnCard, true)))
    .orderBy(asc(categorySpecifications.sortOrder), asc(specificationDefinitions.name));
}

export async function getProductImages(db: DbClient, productId: string) {
  return db
    .select({
      id: productImages.id,
      imageUrl: productImages.imageUrl,
      altText: productImages.altText,
      sortOrder: productImages.sortOrder,
    })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));
}

export async function getProductSpecifications(db: DbClient, productId: string) {
  return db
    .select({
      specificationKey: specificationDefinitions.key,
      label: specificationDefinitions.name,
      dataType: specificationDefinitions.dataType,
      unit: specificationDefinitions.unit,
      numericValue: productSpecValues.numericValue,
      textValue: productSpecValues.textValue,
      booleanValue: productSpecValues.booleanValue,
      rangeMin: productSpecValues.rangeMin,
      rangeMax: productSpecValues.rangeMax,
      jsonValue: productSpecValues.jsonValue,
      normalizedLabel: productSpecValues.normalizedLabel,
      sortOrder: categorySpecifications.sortOrder,
    })
    .from(productSpecValues)
    .innerJoin(
      specificationDefinitions,
      eq(productSpecValues.specificationId, specificationDefinitions.id),
    )
    .innerJoin(products, eq(productSpecValues.productId, products.id))
    .leftJoin(
      categorySpecifications,
      and(
        eq(categorySpecifications.categoryKey, products.categoryKey),
        eq(categorySpecifications.specificationId, specificationDefinitions.id),
      ),
    )
    .where(eq(productSpecValues.productId, productId))
    .orderBy(asc(categorySpecifications.sortOrder), asc(specificationDefinitions.name));
}

export async function listAlternativeProducts(db: DbClient, categoryKey: string, excludeProductId: string, limit = 4) {
  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      brand: products.brand,
      categoryKey: products.categoryKey,
      priceCents: products.priceCents,
      stockQuantity: products.stockQuantity,
      status: products.status,
      thumbnailUrl: products.thumbnailUrl,
      description: products.description,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(and(eq(products.categoryKey, categoryKey), eq(products.status, "ACTIVE"), ne(products.id, excludeProductId)))
    .orderBy(desc(products.updatedAt), asc(products.name))
    .limit(limit);
}
