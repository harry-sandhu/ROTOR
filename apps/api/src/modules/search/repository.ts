import { and, asc, eq, ilike, or } from "drizzle-orm";

import { categories, products, type DbClient } from "@rotor/db";

export async function findSearchSuggestions(db: DbClient, query: string) {
  const searchPattern = `%${query}%`;

  const [productRows, brandRows, categoryRows] = await Promise.all([
    db
      .select({ value: products.name })
      .from(products)
      .where(and(eq(products.status, "ACTIVE"), ilike(products.name, searchPattern)))
      .orderBy(asc(products.name))
      .limit(5),
    db
      .selectDistinct({ value: products.brand })
      .from(products)
      .where(and(eq(products.status, "ACTIVE"), ilike(products.brand, searchPattern)))
      .orderBy(asc(products.brand))
      .limit(5),
    db
      .select({ value: categories.name })
      .from(categories)
      .where(and(eq(categories.isActive, true), or(ilike(categories.name, searchPattern), ilike(categories.key, searchPattern))!))
      .orderBy(asc(categories.sortOrder), asc(categories.name))
      .limit(5),
  ]);

  return {
    products: productRows.map((row) => row.value),
    brands: brandRows.map((row) => row.value),
    categories: categoryRows.map((row) => row.value),
  };
}
