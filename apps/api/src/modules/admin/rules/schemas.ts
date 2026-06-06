import { z } from "zod";

import { adminCompatibilityRuleInputSchema } from "@rotor/contracts";

export const ruleIdParamsSchema = z.object({
  ruleId: z.string().uuid(),
});

export const createRuleSchema = adminCompatibilityRuleInputSchema;
export const updateRuleSchema = adminCompatibilityRuleInputSchema.partial();
