import type { DbClient } from "@rotor/db";

import { listSpecificationDefinitions } from "./repository.js";

export async function getSpecificationDefinitions(db: DbClient) {
  return listSpecificationDefinitions(db);
}
