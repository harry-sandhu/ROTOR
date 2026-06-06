import { z } from "zod";

import { adminProductImportSchema, adminProductInputSchema } from "@rotor/contracts";

export const productIdParamsSchema = z.object({
  productId: z.string().uuid(),
});

export const createAdminProductSchema = adminProductInputSchema;
export const updateAdminProductSchema = adminProductInputSchema.partial();
export const importAdminProductsSchema = adminProductImportSchema;
