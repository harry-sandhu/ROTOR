import type { AdminProductImportInput } from "@rotor/contracts";
import type { DbClient } from "@rotor/db";

import { badRequest } from "../../../lib/errors.js";
import { importProductsForAdmin } from "../products/service.js";

export async function importAdminProducts(db: DbClient, input: AdminProductImportInput) {
  const preview = await importProductsForAdmin(db, { ...input, commit: false });

  if (input.commit && preview.results.some((result) => !result.success)) {
    throw badRequest("IMPORT_VALIDATION_FAILED", "Import contains invalid products.", preview.results);
  }

  if (!input.commit) {
    return preview;
  }

  return importProductsForAdmin(db, input);
}
