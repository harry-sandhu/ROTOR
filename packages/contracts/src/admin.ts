import { z } from "zod";

export const adminValidationIssueSchema = z.object({
  field: z.string().min(1),
  message: z.string().min(1),
});

export const adminValidationResultSchema = z.object({
  isValid: z.boolean(),
  issues: z.array(adminValidationIssueSchema),
});

export type AdminValidationIssue = z.infer<typeof adminValidationIssueSchema>;
export type AdminValidationResult = z.infer<typeof adminValidationResultSchema>;
