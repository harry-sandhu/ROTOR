import { and, eq, inArray } from "drizzle-orm";

import { categories, categorySpecifications, products, specificationDefinitions, type DbClient } from "@rotor/db";

export async function getCategoryValidationMetadata(db: DbClient, categoryKey: string) {
  return db
    .select({
      categoryKey: categorySpecifications.categoryKey,
      specificationId: categorySpecifications.specificationId,
      isRequired: categorySpecifications.isRequired,
      specificationKey: specificationDefinitions.key,
      specificationName: specificationDefinitions.name,
      dataType: specificationDefinitions.dataType,
      unit: specificationDefinitions.unit,
      validation: specificationDefinitions.validationJson,
    })
    .from(categorySpecifications)
    .innerJoin(categories, eq(categorySpecifications.categoryKey, categories.key))
    .innerJoin(
      specificationDefinitions,
      eq(categorySpecifications.specificationId, specificationDefinitions.id),
    )
    .where(and(eq(categorySpecifications.categoryKey, categoryKey), eq(categories.isActive, true)));
}

export async function getActiveProductsByIds(db: DbClient, productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return db
    .select({
      id: products.id,
      categoryKey: products.categoryKey,
      status: products.status,
    })
    .from(products)
    .where(and(inArray(products.id, productIds), eq(products.status, "ACTIVE")));
}

export async function getRuleValidationMetadata(db: DbClient, input: {
  fromCategoryKey: string;
  toCategoryKey: string;
  leftSpecificationKey: string;
  rightSpecificationKey: string;
}) {
  const definitions = await db
    .select({
      categoryKey: categorySpecifications.categoryKey,
      specificationKey: specificationDefinitions.key,
    })
    .from(categorySpecifications)
    .innerJoin(
      specificationDefinitions,
      eq(categorySpecifications.specificationId, specificationDefinitions.id),
    )
    .where(
      and(
        inArray(categorySpecifications.categoryKey, [input.fromCategoryKey, input.toCategoryKey]),
        inArray(specificationDefinitions.key, [input.leftSpecificationKey, input.rightSpecificationKey]),
      ),
    );

  return definitions;
}
