import { describe, expect, it } from "vitest";

import { validateSeedData } from "./validate.seed.js";

describe("validateSeedData", () => {
  it("passes for the seeded MVP catalog", () => {
    const result = validateSeedData();
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});
