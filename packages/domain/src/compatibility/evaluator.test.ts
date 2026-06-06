import { describe, expect, it } from "vitest";

import { evaluateCompatibility } from "./evaluator.js";

describe("evaluateCompatibility", () => {
  it("returns warnings and score for a near-limit compatible build", () => {
    const result = evaluateCompatibility({
      productsByCategory: {
        FRAME: {
          id: "frame-1",
          category: "FRAME",
          priceCents: 7000,
          quantity: 1,
          specs: {
            motorMountPattern: { value: "16x16", normalizedLabel: "16x16" },
            maxPropSize: { value: 5, normalizedLabel: "5 inch" },
            stackMount: { value: "30x30", normalizedLabel: "30x30" },
          },
        },
        MOTOR: {
          id: "motor-1",
          category: "MOTOR",
          priceCents: 2500,
          quantity: 4,
          specs: {
            mountPattern: { value: "16x16", normalizedLabel: "16x16" },
            maxCurrent: { value: 40, normalizedLabel: "40 A" },
            supportedVoltage: { value: { min: 4, max: 6 }, normalizedLabel: "4-6S" },
            recommendedPropSize: { value: 5, normalizedLabel: "5 inch" },
          },
        },
        ESC: {
          id: "esc-1",
          category: "ESC",
          priceCents: 6000,
          quantity: 1,
          specs: {
            currentRating: { value: 45, normalizedLabel: "45 A" },
            supportedVoltage: { value: { min: 4, max: 6 }, normalizedLabel: "4-6S" },
            stackMount: { value: "30x30", normalizedLabel: "30x30" },
          },
        },
        BATTERY: {
          id: "battery-1",
          category: "BATTERY",
          priceCents: 4500,
          quantity: 1,
          specs: {
            cellCount: { value: 6, normalizedLabel: "6S" },
          },
        },
        PROPELLER: {
          id: "prop-1",
          category: "PROPELLER",
          priceCents: 400,
          quantity: 4,
          specs: {
            size: { value: 5, normalizedLabel: "5 inch" },
          },
        },
      },
      rules: [
        {
          key: "frame-motor",
          fromCategory: "FRAME",
          toCategory: "MOTOR",
          leftSpecificationKey: "motorMountPattern",
          rightSpecificationKey: "mountPattern",
          operator: "EQ",
          severityOnFail: "INCOMPATIBLE",
          failureMessageTemplate: "Mount mismatch.",
        },
        {
          key: "frame-prop",
          fromCategory: "FRAME",
          toCategory: "PROPELLER",
          leftSpecificationKey: "maxPropSize",
          rightSpecificationKey: "size",
          operator: "GTE",
          severityOnFail: "INCOMPATIBLE",
          failureMessageTemplate: "Prop too large.",
        },
        {
          key: "esc-motor",
          fromCategory: "ESC",
          toCategory: "MOTOR",
          leftSpecificationKey: "currentRating",
          rightSpecificationKey: "maxCurrent",
          operator: "GTE",
          severityOnFail: "INCOMPATIBLE",
          failureMessageTemplate: "ESC too weak.",
          warningThreshold: { minHeadroomAmps: 5 },
        },
        {
          key: "esc-battery",
          fromCategory: "ESC",
          toCategory: "BATTERY",
          leftSpecificationKey: "supportedVoltage",
          rightSpecificationKey: "cellCount",
          operator: "RANGE_CONTAINS",
          severityOnFail: "INCOMPATIBLE",
          failureMessageTemplate: "Battery voltage mismatch.",
          warningThreshold: { warnAtUpperBound: true },
        },
      ],
    });

    expect(result.validationStatus).toBe("VALID_WITH_WARNINGS");
    expect(result.overallStatus).toBe("WARNING");
    expect(result.issues.some((issue) => issue.code === "LOW_ESC_HEADROOM")).toBe(true);
    expect(result.issues.some((issue) => issue.code === "BATTERY_AT_ESC_LIMIT")).toBe(true);
    expect(result.score).toBeLessThan(100);
  });
});
