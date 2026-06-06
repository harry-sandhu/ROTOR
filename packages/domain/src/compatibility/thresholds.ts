import type { SpecificationValue } from "../specifications.js";

interface WarningThresholdContext {
  ruleKey: string;
  leftValue: SpecificationValue;
  rightValue: SpecificationValue;
  warningThreshold: Record<string, unknown> | null | undefined;
}

export interface ThresholdWarning {
  code: string;
  message: string;
}

function asRange(value: SpecificationValue) {
  return typeof value === "object" && value !== null && "min" in value && "max" in value
    ? { min: Number((value as { min: number }).min), max: Number((value as { max: number }).max) }
    : null;
}

export function evaluateThresholdWarning(context: WarningThresholdContext): ThresholdWarning | null {
  const thresholds = context.warningThreshold ?? null;

  if (!thresholds) {
    return null;
  }

  if (typeof thresholds.minHeadroomAmps === "number") {
    const left = typeof context.leftValue === "number" ? context.leftValue : null;
    const right = typeof context.rightValue === "number" ? context.rightValue : null;

    if (left !== null && right !== null && left - right <= thresholds.minHeadroomAmps) {
      return {
        code: "LOW_ESC_HEADROOM",
        message: "ESC current rating is compatible but has low safety headroom.",
      };
    }
  }

  if (thresholds.warnAtUpperBound === true) {
    const range = asRange(context.leftValue);
    const point = typeof context.rightValue === "number" ? context.rightValue : null;

    if (range && point !== null && point === range.max) {
      if (context.ruleKey.includes("esc-battery")) {
        return {
          code: "BATTERY_AT_ESC_LIMIT",
          message: "Battery is at the ESC's maximum supported voltage.",
        };
      }

      if (context.ruleKey.includes("motor-battery")) {
        return {
          code: "BATTERY_AT_MOTOR_LIMIT",
          message: "Battery is at the motor's maximum supported voltage.",
        };
      }
    }
  }

  return null;
}
