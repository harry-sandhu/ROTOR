import { asc } from "drizzle-orm";

import { specificationDefinitions, type DbClient } from "@rotor/db";

export async function listSpecificationDefinitions(db: DbClient) {
  return db
    .select({
      id: specificationDefinitions.id,
      key: specificationDefinitions.key,
      name: specificationDefinitions.name,
      description: specificationDefinitions.description,
      dataType: specificationDefinitions.dataType,
      unit: specificationDefinitions.unit,
      validationJson: specificationDefinitions.validationJson,
      searchWeight: specificationDefinitions.searchWeight,
      isFilterable: specificationDefinitions.isFilterable,
      isSearchable: specificationDefinitions.isSearchable,
      createdAt: specificationDefinitions.createdAt,
      updatedAt: specificationDefinitions.updatedAt,
    })
    .from(specificationDefinitions)
    .orderBy(asc(specificationDefinitions.name));
}
