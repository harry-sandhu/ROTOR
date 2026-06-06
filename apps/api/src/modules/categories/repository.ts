import { and, asc, eq } from "drizzle-orm";

import { categories, categorySpecifications, specificationDefinitions, type DbClient } from "@rotor/db";

export async function listActiveCategories(db: DbClient) {
  return db
    .select({
      key: categories.key,
      name: categories.name,
      description: categories.description,
      sortOrder: categories.sortOrder,
      isActive: categories.isActive,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function listCategorySpecifications(db: DbClient, categoryKey: string) {
  return db
    .select({
      id: categorySpecifications.id,
      categoryKey: categorySpecifications.categoryKey,
      specificationId: categorySpecifications.specificationId,
      isRequired: categorySpecifications.isRequired,
      isFilterable: categorySpecifications.isFilterable,
      isVisibleOnCard: categorySpecifications.isVisibleOnCard,
      sortOrder: categorySpecifications.sortOrder,
      specificationKey: specificationDefinitions.key,
      specificationName: specificationDefinitions.name,
      description: specificationDefinitions.description,
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
    .where(and(eq(categorySpecifications.categoryKey, categoryKey), eq(categories.isActive, true)))
    .orderBy(asc(categorySpecifications.sortOrder), asc(specificationDefinitions.name));
}
