import { users } from "../schema/auth.js";
import { buildComponents, buildEvaluations, builds } from "../schema/builds.js";
import { categories, productImages, products } from "../schema/catalog.js";
import { compatibilityRuleDefinitions } from "../schema/compatibility.js";
import { categorySpecifications, productSpecValues, specificationDefinitions } from "../schema/specifications.js";
import { createDbConnection } from "../client.js";
import { loadDbEnv } from "../env.js";
import { categorySpecificationSeeds } from "./category-specifications.seed.js";
import { categoriesSeed } from "./categories.seed.js";
import { compatibilityRuleSeeds } from "./compatibility-rules.seed.js";
import { seededProductCounts, seededProductRows } from "./products.seed.js";
import { sampleBuildComponentSeeds, sampleBuildEvaluationSeeds, sampleBuildSeeds } from "./sample-builds.seed.js";
import { sampleUserSeeds } from "./sample-users.seed.js";
import { specificationDefinitionSeeds } from "./specification-definitions.seed.js";
import { validateSeedData } from "./validate.seed.js";

async function resetSeedTables(db: ReturnType<typeof createDbConnection>["db"]): Promise<void> {
  await db.delete(buildEvaluations);
  await db.delete(buildComponents);
  await db.delete(builds);
  await db.delete(users);
  await db.delete(compatibilityRuleDefinitions);
  await db.delete(productSpecValues);
  await db.delete(productImages);
  await db.delete(products);
  await db.delete(categorySpecifications);
  await db.delete(specificationDefinitions);
  await db.delete(categories);
}

export async function runSeeds(): Promise<void> {
  const env = loadDbEnv();
  const { db, pool } = createDbConnection(env.DATABASE_URL);

  try {
    const validation = validateSeedData();

    if (!validation.isValid) {
      throw new Error(`Seed validation failed: ${validation.issues.map((issue) => issue.message).join("; ")}`);
    }

    await resetSeedTables(db);

    await db.insert(categories).values(categoriesSeed);
    await db.insert(specificationDefinitions).values(specificationDefinitionSeeds);
    await db.insert(categorySpecifications).values(categorySpecificationSeeds);
    await db.insert(compatibilityRuleDefinitions).values(compatibilityRuleSeeds);
    await db.insert(products).values(seededProductRows.products);
    await db.insert(productImages).values(seededProductRows.images);
    await db.insert(productSpecValues).values(seededProductRows.specValues);
    await db.insert(users).values(sampleUserSeeds);
    await db.insert(builds).values(sampleBuildSeeds);
    await db.insert(buildComponents).values(sampleBuildComponentSeeds);
    await db.insert(buildEvaluations).values(sampleBuildEvaluationSeeds);

    console.info("Rotor seed completed successfully.");
    console.info(`Categories: ${categoriesSeed.length}`);
    console.info(`Specification definitions: ${specificationDefinitionSeeds.length}`);
    console.info(`Category specification mappings: ${categorySpecificationSeeds.length}`);
    console.info(`Compatibility rules: ${compatibilityRuleSeeds.length}`);
    console.info(`Frames: ${seededProductCounts.frames}`);
    console.info(`Motors: ${seededProductCounts.motors}`);
    console.info(`ESCs: ${seededProductCounts.escs}`);
    console.info(`Batteries: ${seededProductCounts.batteries}`);
    console.info(`Propellers: ${seededProductCounts.propellers}`);
    console.info(`Products total: ${seededProductCounts.total}`);
    console.info(`Product images: ${seededProductRows.images.length}`);
    console.info(`Product specification values: ${seededProductRows.specValues.length}`);
    console.info(`Sample users: ${sampleUserSeeds.length}`);
    console.info(`Sample builds: ${sampleBuildSeeds.length}`);
  } finally {
    await pool.end();
  }
}

if (import.meta.main) {
  await runSeeds();
}
