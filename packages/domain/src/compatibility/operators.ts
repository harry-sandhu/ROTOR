import type { NumericRangeValue, SpecificationValue } from "../specifications.js";
import type { RuleOperator } from "./types.js";

function asNumber(value: SpecificationValue): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asString(value: SpecificationValue): string | null {
  return typeof value === "string" ? value : null;
}

function asRange(value: SpecificationValue): NumericRangeValue | null {
  if (typeof value === "object" && value !== null && "min" in value && "max" in value) {
    const min = (value as NumericRangeValue).min;
    const max = (value as NumericRangeValue).max;

    if (typeof min === "number" && typeof max === "number") {
      return { min, max };
    }
  }

  return null;
}

function asArray(value: SpecificationValue): readonly unknown[] | null {
  return Array.isArray(value) ? value : null;
}

export function evaluateRuleOperator(operator: RuleOperator, left: SpecificationValue, right: SpecificationValue): boolean {
  switch (operator) {
    case "EQ":
      return left === right;
    case "NEQ":
      return left !== right;
    case "GTE": {
      const leftNumber = asNumber(left);
      const rightNumber = asNumber(right);
      return leftNumber !== null && rightNumber !== null ? leftNumber >= rightNumber : false;
    }
    case "LTE": {
      const leftNumber = asNumber(left);
      const rightNumber = asNumber(right);
      return leftNumber !== null && rightNumber !== null ? leftNumber <= rightNumber : false;
    }
    case "RANGE_CONTAINS": {
      const range = asRange(left);
      const point = asNumber(right);
      return range !== null && point !== null ? point >= range.min && point <= range.max : false;
    }
    case "RANGE_OVERLAPS": {
      const leftRange = asRange(left);
      const rightRange = asRange(right);
      return leftRange !== null && rightRange !== null
        ? leftRange.min <= rightRange.max && rightRange.min <= leftRange.max
        : false;
    }
    case "ARRAY_CONTAINS": {
      const arrayValue = asArray(left);
      return arrayValue !== null ? arrayValue.includes(right) : false;
    }
    case "ARRAY_OVERLAPS": {
      const leftArray = asArray(left);
      const rightArray = asArray(right);
      return leftArray !== null && rightArray !== null
        ? leftArray.some((candidate) => rightArray.includes(candidate))
        : false;
    }
    default:
      return false;
  }
}

export function describeComparableValue(value: SpecificationValue): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    if ("min" in value && "max" in value) {
      const range = value as NumericRangeValue;
      return `${range.min}-${range.max}`;
    }

    return JSON.stringify(value);
  }

  return asString(value) ?? String(value);
}
