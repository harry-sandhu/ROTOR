export const specificationDataTypeValues = ["NUMBER", "TEXT", "BOOLEAN", "ENUM", "RANGE", "ARRAY", "JSON"] as const;

export type SpecificationDataType = (typeof specificationDataTypeValues)[number];

export interface NumericRangeValue {
  min: number;
  max: number;
}

export type SpecificationPrimitiveValue = number | string | boolean;
export type SpecificationValue =
  | SpecificationPrimitiveValue
  | NumericRangeValue
  | readonly unknown[]
  | Record<string, unknown>
  | null;

export interface SpecificationDefinition {
  id: string;
  key: string;
  name: string;
  description: string | null;
  dataType: SpecificationDataType;
  unit: string | null;
  validation: Record<string, unknown>;
  searchWeight: number;
  isFilterable: boolean;
  isSearchable: boolean;
}

export interface ProductSpecificationValue {
  specificationKey: string;
  label: string;
  dataType: SpecificationDataType;
  unit: string | null;
  value: SpecificationValue;
  normalizedLabel: string | null;
}
