import { notFound } from "../../lib/errors.js";
import { listActiveCategories, listCategorySpecifications } from "./repository.js";
import type { DbClient } from "@rotor/db";

export async function getActiveCategories(db: DbClient) {
  return listActiveCategories(db);
}

export async function getCategorySpecifications(db: DbClient, categoryKey: string) {
  const categorySpecs = await listCategorySpecifications(db, categoryKey);

  if (categorySpecs.length === 0) {
    throw notFound("CATEGORY_NOT_FOUND", `No specification metadata found for category ${categoryKey}.`);
  }

  return categorySpecs;
}
