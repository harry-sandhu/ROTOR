import { z } from "zod";

import { createBuildRequestSchema, updateBuildComponentRequestSchema, updateBuildRequestSchema } from "@rotor/contracts";

export const buildIdParamsSchema = z.object({
  buildId: z.string().uuid(),
});

export const buildComponentParamsSchema = z.object({
  buildId: z.string().uuid(),
  categoryKey: z.string().min(1),
});

export { createBuildRequestSchema, updateBuildRequestSchema, updateBuildComponentRequestSchema };
