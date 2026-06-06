import { z } from "zod";

import { productStatusSchema } from "@rotor/contracts";

export const productListQuerySchema = z
  .object({
    category: z.string().min(1).optional(),
    brand: z.string().min(1).optional(),
    status: productStatusSchema.optional(),
    minPrice: z.coerce.number().int().nonnegative().optional(),
    maxPrice: z.coerce.number().int().nonnegative().optional(),
    search: z.string().min(1).optional(),
    inStock: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
  })
  .passthrough();

export const productIdParamsSchema = z.object({
  productId: z.string().uuid(),
});

export const productSlugParamsSchema = z.object({
  slug: z.string().min(1),
});
