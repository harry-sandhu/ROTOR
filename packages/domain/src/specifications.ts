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

export interface NormalizedSpecificationValue {
  value: SpecificationValue;
  normalizedLabel: string | null;
  dataType: SpecificationDataType;
  unit: string | null;
}

export interface SpecificationValidationIssue {
  field: string;
  message: string;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatScalarLabel(value: string | number | boolean | null, unit: string | null): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return unit ? `${value} ${unit}` : String(value);
}

function formatRangeLabel(value: NumericRangeValue, unit: string | null): string {
  return unit ? `${value.min}-${value.max}${unit}` : `${value.min}-${value.max}`;
}

export function normalizeSpecificationValue(input: {
  dataType: SpecificationDataType;
  unit: string | null;
  value: unknown;
}): NormalizedSpecificationValue {
  const { dataType, unit, value } = input;

  switch (dataType) {
    case "NUMBER": {
      const numericValue = toNumber(value);
      return {
        value: numericValue,
        normalizedLabel: formatScalarLabel(numericValue, unit),
        dataType,
        unit,
      };
    }
    case "TEXT":
    case "ENUM": {
      const textValue = value === null || value === undefined ? null : String(value).trim();
      return {
        value: textValue,
        normalizedLabel: formatScalarLabel(textValue, unit),
        dataType,
        unit,
      };
    }
    case "BOOLEAN": {
      const booleanValue = typeof value === "boolean" ? value : value === "true" ? true : value === "false" ? false : null;
      return {
        value: booleanValue,
        normalizedLabel: formatScalarLabel(booleanValue, unit),
        dataType,
        unit,
      };
    }
    case "RANGE": {
      if (typeof value === "object" && value !== null && "min" in value && "max" in value) {
        const min = toNumber((value as { min: unknown }).min);
        const max = toNumber((value as { max: unknown }).max);
        const rangeValue = min !== null && max !== null ? { min, max } : null;

        return {
          value: rangeValue,
          normalizedLabel: rangeValue ? formatRangeLabel(rangeValue, unit) : null,
          dataType,
          unit,
        };
      }

      return {
        value: null,
        normalizedLabel: null,
        dataType,
        unit,
      };
    }
    case "ARRAY": {
      const arrayValue = Array.isArray(value) ? value : value === null || value === undefined ? null : [value];
      return {
        value: arrayValue,
        normalizedLabel: arrayValue ? JSON.stringify(arrayValue) : null,
        dataType,
        unit,
      };
    }
    case "JSON": {
      const jsonValue = value !== undefined ? ((value as Record<string, unknown>) ?? null) : null;
      return {
        value: jsonValue,
        normalizedLabel: jsonValue ? JSON.stringify(jsonValue) : null,
        dataType,
        unit,
      };
    }
    default:
      return {
        value: null,
        normalizedLabel: null,
        dataType,
        unit,
      };
  }
}

function validateNumericBounds(field: string, value: number, validation: Record<string, unknown>, issues: SpecificationValidationIssue[]) {
  const min = toNumber(validation.min);
  const max = toNumber(validation.max);

  if (min !== null && value < min) {
    issues.push({ field, message: `Value must be greater than or equal to ${min}.` });
  }

  if (max !== null && value > max) {
    issues.push({ field, message: `Value must be less than or equal to ${max}.` });
  }
}

export function validateSpecificationValue(
  definition: Pick<SpecificationDefinition, "key" | "dataType" | "validation" | "unit">,
  value: unknown,
): SpecificationValidationIssue[] {
  const issues: SpecificationValidationIssue[] = [];
  const field = `specs.${definition.key}`;
  const normalized = normalizeSpecificationValue({
    dataType: definition.dataType,
    unit: definition.unit,
    value,
  });

  switch (definition.dataType) {
    case "NUMBER": {
      if (typeof normalized.value !== "number") {
        issues.push({ field, message: "Expected a numeric value." });
        break;
      }

      validateNumericBounds(field, normalized.value, definition.validation, issues);
      break;
    }
    case "TEXT":
      if (typeof normalized.value !== "string" || normalized.value.length === 0) {
        issues.push({ field, message: "Expected a non-empty text value." });
      }
      break;
    case "ENUM": {
      if (typeof normalized.value !== "string" || normalized.value.length === 0) {
        issues.push({ field, message: "Expected a non-empty enum value." });
        break;
      }

      const options = Array.isArray(definition.validation.options)
        ? definition.validation.options.filter((option): option is string => typeof option === "string")
        : [];

      if (options.length > 0 && !options.includes(normalized.value)) {
        issues.push({ field, message: `Value must be one of: ${options.join(", ")}.` });
      }
      break;
    }
    case "BOOLEAN":
      if (typeof normalized.value !== "boolean") {
        issues.push({ field, message: "Expected a boolean value." });
      }
      break;
    case "RANGE": {
      if (
        typeof normalized.value !== "object" ||
        normalized.value === null ||
        !("min" in normalized.value) ||
        !("max" in normalized.value)
      ) {
        issues.push({ field, message: "Expected a range value with min and max." });
        break;
      }

      const rangeValue = normalized.value as NumericRangeValue;

      validateNumericBounds(`${field}.min`, rangeValue.min, definition.validation, issues);
      validateNumericBounds(`${field}.max`, rangeValue.max, definition.validation, issues);

      if (rangeValue.max < rangeValue.min) {
        issues.push({ field, message: "Range max must be greater than or equal to range min." });
      }
      break;
    }
    case "ARRAY":
      if (!Array.isArray(normalized.value)) {
        issues.push({ field, message: "Expected an array value." });
      }
      break;
    case "JSON":
      if (normalized.value === undefined) {
        issues.push({ field, message: "Expected a JSON-compatible value." });
      }
      break;
  }

  return issues;
}
