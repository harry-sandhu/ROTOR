import { z } from "zod";

import { adminSpecificationInputSchema } from "@rotor/contracts";

export const specificationIdParamsSchema = z.object({
  specificationId: z.string().uuid(),
});

export const createSpecificationSchema = adminSpecificationInputSchema;
export const updateSpecificationSchema = adminSpecificationInputSchema.partial();
