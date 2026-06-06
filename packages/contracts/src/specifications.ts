import { z } from "zod";

import { categoryKeySchema } from "./categories.js";

export const specificationDataTypeSchema = z.enum(["NUMBER", "TEXT", "BOOLEAN", "ENUM", "RANGE", "ARRAY", "JSON"]);

export const specificationValidationSchema = z.record(z.string(), z.unknown());

export const numericRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const specificationDefinitionSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  dataType: specificationDataTypeSchema,
  unit: z.string().nullable(),
  validation: specificationValidationSchema,
  searchWeight: z.number().int(),
  isFilterable: z.boolean(),
  isSearchable: z.boolean(),
});

export const categorySpecificationSchema = z.object({
  id: z.string().uuid(),
  categoryKey: categoryKeySchema,
  specificationId: z.string().uuid(),
  isRequired: z.boolean(),
  isFilterable: z.boolean(),
  isVisibleOnCard: z.boolean(),
  sortOrder: z.number().int(),
});

export const specificationValueSchema = z.union([
  z.number(),
  z.string(),
  z.boolean(),
  numericRangeSchema,
  z.array(z.unknown()),
  z.record(z.string(), z.unknown()),
  z.null(),
]);

export const productSpecificationSchema = z.object({
  specificationKey: z.string().min(1),
  label: z.string().min(1),
  dataType: specificationDataTypeSchema,
  unit: z.string().nullable(),
  value: specificationValueSchema,
  normalizedLabel: z.string().nullable(),
});

export type SpecificationDataType = z.infer<typeof specificationDataTypeSchema>;
export type NumericRange = z.infer<typeof numericRangeSchema>;
export type SpecificationDefinition = z.infer<typeof specificationDefinitionSchema>;
export type CategorySpecification = z.infer<typeof categorySpecificationSchema>;
export type ProductSpecification = z.infer<typeof productSpecificationSchema>;
