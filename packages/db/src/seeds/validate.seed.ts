import { compatibilityRuleSeeds } from "./compatibility-rules.seed.js";
import { seededProductCounts, seededProductRows } from "./products.seed.js";
import { sampleBuildComponentSeeds, sampleBuildSeeds, sampleBuildEvaluationSeeds } from "./sample-builds.seed.js";
import { sampleUserSeeds } from "./sample-users.seed.js";

export interface SeedValidationIssue {
  code: string;
  message: string;
}

export interface SeedValidationResult {
  isValid: boolean;
  issues: SeedValidationIssue[];
}

export function validateSeedData(): SeedValidationResult {
  const issues: SeedValidationIssue[] = [];

  if (seededProductCounts.frames < 20) {
    issues.push({ code: "FRAME_COUNT_TOO_LOW", message: "Expected at least 20 frame products." });
  }

  if (seededProductCounts.motors < 50) {
    issues.push({ code: "MOTOR_COUNT_TOO_LOW", message: "Expected at least 50 motor products." });
  }

  if (seededProductCounts.escs < 30) {
    issues.push({ code: "ESC_COUNT_TOO_LOW", message: "Expected at least 30 ESC products." });
  }

  if (seededProductCounts.batteries < 20) {
    issues.push({ code: "BATTERY_COUNT_TOO_LOW", message: "Expected at least 20 battery products." });
  }

  if (seededProductCounts.propellers < 30) {
    issues.push({ code: "PROPELLER_COUNT_TOO_LOW", message: "Expected at least 30 propeller products." });
  }

  if (compatibilityRuleSeeds.length < 7) {
    issues.push({ code: "RULE_COUNT_TOO_LOW", message: "Expected all MVP compatibility rules to be seeded." });
  }

  if (sampleUserSeeds.length < 2) {
    issues.push({ code: "SAMPLE_USERS_MISSING", message: "Expected demo and admin sample users." });
  }

  if (sampleBuildSeeds.length === 0 || sampleBuildComponentSeeds.length === 0 || sampleBuildEvaluationSeeds.length === 0) {
    issues.push({ code: "SAMPLE_BUILD_MISSING", message: "Expected at least one compatible sample build with evaluation." });
  }

  const requiredCategories = new Set(["FRAME", "MOTOR", "ESC", "BATTERY", "PROPELLER"]);
  const selectedCategories = new Set(sampleBuildComponentSeeds.map((component) => component.categoryKey));

  for (const category of requiredCategories) {
    if (!selectedCategories.has(category)) {
      issues.push({
        code: "SAMPLE_BUILD_INCOMPLETE",
        message: `Sample build is missing category ${category}.`,
      });
    }
  }

  const productIds = new Set(seededProductRows.products.map((product) => product.id));

  for (const component of sampleBuildComponentSeeds) {
    if (!productIds.has(component.productId)) {
      issues.push({
        code: "SAMPLE_BUILD_PRODUCT_MISSING",
        message: `Sample build references missing product ${component.productId}.`,
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
