import type { NewBuild, NewBuildComponent, NewBuildEvaluation } from "../schema/builds.js";
import { seededProductRows } from "./products.seed.js";
import { stableUuid } from "./shared.js";
import { sampleUserSeeds } from "./sample-users.seed.js";

const selectedProductSlugs = {
  FRAME: "aeroforge-f5-v2",
  MOTOR: "skymantis-2207-1900kv-3",
  ESC: "rotorworks-45a-30x30-4-6s-3",
  BATTERY: "skycharge-6s-1300-100c-freestyle-11",
  PROPELLER: "rotorworks-5in-4-1-tri-blade-17",
} as const;

function getProductBySlug(slug: string) {
  const product = seededProductRows.products.find((candidate) => candidate.slug === slug);

  if (!product) {
    throw new Error(`Seed product not found for sample build slug: ${slug}`);
  }

  return product;
}

const sampleBuildId = stableUuid("build:demo:freestyle");
const demoUserId = sampleUserSeeds[0]!.id!;

const selectedProducts = {
  FRAME: getProductBySlug(selectedProductSlugs.FRAME),
  MOTOR: getProductBySlug(selectedProductSlugs.MOTOR),
  ESC: getProductBySlug(selectedProductSlugs.ESC),
  BATTERY: getProductBySlug(selectedProductSlugs.BATTERY),
  PROPELLER: getProductBySlug(selectedProductSlugs.PROPELLER),
};

const totalCostCents =
  selectedProducts.FRAME.priceCents +
  selectedProducts.MOTOR.priceCents * 4 +
  selectedProducts.ESC.priceCents +
  selectedProducts.BATTERY.priceCents +
  selectedProducts.PROPELLER.priceCents * 4;

export const sampleBuildSeeds: NewBuild[] = [
  {
    id: sampleBuildId,
    userId: demoUserId,
    name: "Demo 6S Freestyle Build",
    description: "Seeded compatible build for immediate Rotor validation and UI testing.",
    visibility: "PUBLIC",
  },
];

export const sampleBuildComponentSeeds: NewBuildComponent[] = [
  {
    id: stableUuid(`build-component:${sampleBuildId}:FRAME`),
    buildId: sampleBuildId,
    productId: selectedProducts.FRAME.id!,
    categoryKey: "FRAME",
    quantity: 1,
  },
  {
    id: stableUuid(`build-component:${sampleBuildId}:MOTOR`),
    buildId: sampleBuildId,
    productId: selectedProducts.MOTOR.id!,
    categoryKey: "MOTOR",
    quantity: 4,
  },
  {
    id: stableUuid(`build-component:${sampleBuildId}:ESC`),
    buildId: sampleBuildId,
    productId: selectedProducts.ESC.id!,
    categoryKey: "ESC",
    quantity: 1,
  },
  {
    id: stableUuid(`build-component:${sampleBuildId}:BATTERY`),
    buildId: sampleBuildId,
    productId: selectedProducts.BATTERY.id!,
    categoryKey: "BATTERY",
    quantity: 1,
  },
  {
    id: stableUuid(`build-component:${sampleBuildId}:PROPELLER`),
    buildId: sampleBuildId,
    productId: selectedProducts.PROPELLER.id!,
    categoryKey: "PROPELLER",
    quantity: 4,
  },
];

export const sampleBuildEvaluationSeeds: NewBuildEvaluation[] = [
  {
    buildId: sampleBuildId,
    compatibilityScore: 100,
    validationStatus: "VALID",
    totalCostCents,
    missingCategories: [],
    warnings: [],
    issues: [],
  },
];
