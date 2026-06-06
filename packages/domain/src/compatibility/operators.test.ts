import { describe, expect, it } from "vitest";

import { evaluateRuleOperator } from "./operators.js";

describe("evaluateRuleOperator", () => {
  it("supports EQ", () => {
    expect(evaluateRuleOperator("EQ", "30x30", "30x30")).toBe(true);
    expect(evaluateRuleOperator("EQ", "30x30", "20x20")).toBe(false);
  });

  it("supports GTE", () => {
    expect(evaluateRuleOperator("GTE", 45, 38)).toBe(true);
    expect(evaluateRuleOperator("GTE", 35, 38)).toBe(false);
  });

  it("supports RANGE_CONTAINS", () => {
    expect(evaluateRuleOperator("RANGE_CONTAINS", { min: 4, max: 6 }, 6)).toBe(true);
    expect(evaluateRuleOperator("RANGE_CONTAINS", { min: 4, max: 6 }, 3)).toBe(false);
  });
});
