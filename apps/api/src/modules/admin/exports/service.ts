import type { DbClient } from "@rotor/db";

import { exportProductsForAdmin } from "../products/service.js";
import { listRules } from "../rules/service.js";
import { listSpecifications } from "../specifications/service.js";

export async function exportAdminProducts(db: DbClient) {
  return exportProductsForAdmin(db);
}

export async function exportAdminSpecifications(db: DbClient) {
  return listSpecifications(db);
}

export async function exportAdminRules(db: DbClient) {
  return listRules(db);
}
