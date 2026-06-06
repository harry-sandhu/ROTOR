import { randomUUID } from "node:crypto";

import type { AdminSpecificationInput } from "@rotor/contracts";
import type { DbClient } from "@rotor/db";

import { conflict, notFound } from "../../../lib/errors.js";

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}
import {
  createAdminSpecificationDefinition,
  deleteAdminSpecificationDefinition,
  getAdminSpecificationDefinitionById,
  getAdminSpecificationDefinitionByKey,
  listAdminSpecificationDefinitions,
  updateAdminSpecificationDefinition,
} from "./repository.js";

export async function listSpecifications(db: DbClient) {
  return listAdminSpecificationDefinitions(db);
}

export async function createSpecification(db: DbClient, input: AdminSpecificationInput) {
  const existing = await getAdminSpecificationDefinitionByKey(db, input.key);
  if (existing) {
    throw conflict("SPECIFICATION_KEY_EXISTS", `Specification key ${input.key} already exists.`);
  }

  return createAdminSpecificationDefinition(db, {
    id: randomUUID(),
    key: input.key,
    name: input.name,
    description: input.description ?? null,
    dataType: input.dataType,
    unit: input.unit ?? null,
    validationJson: input.validation,
    searchWeight: input.searchWeight,
    isFilterable: input.isFilterable,
    isSearchable: input.isSearchable,
  });
}

export async function updateSpecification(
  db: DbClient,
  specificationId: string,
  input: Partial<AdminSpecificationInput & Record<string, unknown>>,
) {
  const existing = await getAdminSpecificationDefinitionById(db, specificationId);
  if (!existing) {
    throw notFound("SPECIFICATION_NOT_FOUND", "Specification not found.");
  }

  if (input.key && input.key !== existing.key) {
    const duplicate = await getAdminSpecificationDefinitionByKey(db, input.key);
    if (duplicate) {
      throw conflict("SPECIFICATION_KEY_EXISTS", `Specification key ${input.key} already exists.`);
    }
  }

  const payload = omitUndefined({
    key: input.key,
    name: input.name,
    description: input.description ?? existing.description,
    dataType: input.dataType,
    unit: input.unit ?? existing.unit,
    validationJson: input.validation,
    searchWeight: input.searchWeight,
    isFilterable: input.isFilterable,
    isSearchable: input.isSearchable,
  }) as never;

  return updateAdminSpecificationDefinition(db, specificationId, payload);
}

export async function removeSpecification(db: DbClient, specificationId: string) {
  const existing = await getAdminSpecificationDefinitionById(db, specificationId);
  if (!existing) {
    throw notFound("SPECIFICATION_NOT_FOUND", "Specification not found.");
  }

  await deleteAdminSpecificationDefinition(db, specificationId);
  return { success: true };
}
