import { randomUUID } from "node:crypto";

import type { AdminCategorySpecificationAssignment } from "@rotor/contracts";
import type { DbClient } from "@rotor/db";

import { badRequest } from "../../../lib/errors.js";
import {
  getSpecificationDefinitionsByKeys,
  listCategorySpecificationAssignments,
  replaceCategorySpecificationAssignments,
} from "./repository.js";

export async function getCategoryAssignments(db: DbClient, categoryKey: string) {
  return listCategorySpecificationAssignments(db, categoryKey);
}

export async function updateCategoryAssignments(
  db: DbClient,
  categoryKey: string,
  assignments: AdminCategorySpecificationAssignment[],
) {
  const definitionRows = await getSpecificationDefinitionsByKeys(
    db,
    assignments.map((assignment) => assignment.specificationKey),
  );
  const definitionByKey = new Map(definitionRows.map((row) => [row.key, row]));

  for (const assignment of assignments) {
    if (!definitionByKey.has(assignment.specificationKey)) {
      throw badRequest(
        "SPECIFICATION_NOT_FOUND",
        `Specification ${assignment.specificationKey} does not exist.`,
      );
    }
  }

  await replaceCategorySpecificationAssignments(
    db,
    categoryKey,
    assignments.map((assignment) => ({
      id: randomUUID(),
      categoryKey,
      specificationId: definitionByKey.get(assignment.specificationKey)!.id,
      isRequired: assignment.isRequired,
      isFilterable: assignment.isFilterable,
      isVisibleOnCard: assignment.isVisibleOnCard,
      sortOrder: assignment.sortOrder,
    })),
  );

  return getCategoryAssignments(db, categoryKey);
}
