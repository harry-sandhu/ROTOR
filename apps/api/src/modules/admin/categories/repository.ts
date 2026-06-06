import { and, asc, eq, inArray } from "drizzle-orm";

import { categorySpecifications, specificationDefinitions, type DbClient, type NewCategorySpecification } from "@rotor/db";

export async function listCategorySpecificationAssignments(db: DbClient, categoryKey: string) {
  return db
    .select({
      id: categorySpecifications.id,
      categoryKey: categorySpecifications.categoryKey,
      specificationId: categorySpecifications.specificationId,
      specificationKey: specificationDefinitions.key,
      specificationName: specificationDefinitions.name,
      isRequired: categorySpecifications.isRequired,
      isFilterable: categorySpecifications.isFilterable,
      isVisibleOnCard: categorySpecifications.isVisibleOnCard,
      sortOrder: categorySpecifications.sortOrder,
    })
    .from(categorySpecifications)
    .innerJoin(
      specificationDefinitions,
      eq(categorySpecifications.specificationId, specificationDefinitions.id),
    )
    .where(eq(categorySpecifications.categoryKey, categoryKey))
    .orderBy(asc(categorySpecifications.sortOrder), asc(specificationDefinitions.name));
}

export async function getSpecificationDefinitionsByKeys(db: DbClient, keys: string[]) {
  if (keys.length === 0) {
    return [];
  }

  return db
    .select({
      id: specificationDefinitions.id,
      key: specificationDefinitions.key,
      name: specificationDefinitions.name,
    })
    .from(specificationDefinitions)
    .where(inArray(specificationDefinitions.key, keys));
}

export async function replaceCategorySpecificationAssignments(
  db: DbClient,
  categoryKey: string,
  values: NewCategorySpecification[],
) {
  await db.delete(categorySpecifications).where(eq(categorySpecifications.categoryKey, categoryKey));

  if (values.length > 0) {
    await db.insert(categorySpecifications).values(values);
  }
}
