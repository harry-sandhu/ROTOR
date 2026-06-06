import { randomUUID } from "node:crypto";

import type { BuildDetail, BuildSummary, CompatibilityEvaluation, ProductSummary } from "@rotor/contracts";
import type { DbClient } from "@rotor/db";

import { badRequest, forbidden, notFound } from "../../lib/errors.js";
import { mapProductSummary } from "../products/mapper.js";
import { getProductSummarySpecs } from "../products/repository.js";
import { evaluateBuildCompatibility } from "../compatibility/service.js";
import { fromBuildEvaluationSnapshot, toBuildEvaluationSnapshot } from "./calculator.js";
import {
  createBuildComponentRecord,
  createBuildRecord,
  deleteBuildComponentRecord,
  deleteBuildEvaluationSnapshot,
  deleteBuildRecord,
  getBuildById,
  getBuildComponentByCategory,
  getBuildEvaluationSnapshot,
  getSharedBuildById,
  getUserBuildById,
  listBuildComponents,
  listBuildsForUser,
  saveBuildEvaluationSnapshot,
  updateBuildComponentRecord,
  updateBuildRecord,
} from "./repository.js";
import { getActiveProductsByIds } from "../compatibility/repository.js";

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

function toBuildSummary(build: {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  visibility: "PRIVATE" | "UNLISTED" | "PUBLIC";
  createdAt: Date;
  updatedAt: Date;
}): BuildSummary {
  return {
    id: build.id,
    userId: build.userId,
    name: build.name,
    description: build.description,
    visibility: build.visibility,
    createdAt: build.createdAt.toISOString(),
    updatedAt: build.updatedAt.toISOString(),
  };
}

async function mapBuildComponentsToResponse(
  db: DbClient,
  components: Awaited<ReturnType<typeof listBuildComponents>>,
) {
  const summarySpecs = await getProductSummarySpecs(
    db,
    components.map((component) => component.productId),
  );
  const groupedSummarySpecs = summarySpecs.reduce<Record<string, Array<{ specificationKey: string; label: string; value: string | null }>>>((accumulator, spec) => {
    const current = accumulator[spec.productId] ?? [];
    current.push({ specificationKey: spec.specificationKey, label: spec.label, value: spec.value });
    accumulator[spec.productId] = current;
    return accumulator;
  }, {});

  return components.map((component) => ({
    category: component.categoryKey,
    productId: component.productId,
    quantity: component.quantity,
    product: mapProductSummary(
      {
        id: component.productId,
        slug: component.productSlug,
        name: component.productName,
        brand: component.productBrand,
        categoryKey: component.productCategoryKey,
        priceCents: component.productPriceCents,
        stockQuantity: component.productStockQuantity,
        status: component.productStatus,
        thumbnailUrl: component.productThumbnailUrl,
      },
      groupedSummarySpecs[component.productId] ?? [],
    ),
  }));
}

function toSelections(components: Awaited<ReturnType<typeof listBuildComponents>>) {
  return Object.fromEntries(
    components.map((component) => [
      component.categoryKey,
      {
        productId: component.productId,
        quantity: component.quantity,
      },
    ]),
  ) as Record<string, { productId: string; quantity: number }>;
}

async function recalculateBuildEvaluation(db: DbClient, buildId: string) {
  const components = await listBuildComponents(db, buildId);
  const selections = toSelections(components);
  const evaluation = await evaluateBuildCompatibility(db, selections);
  await saveBuildEvaluationSnapshot(db, toBuildEvaluationSnapshot(buildId, evaluation));
  return evaluation;
}

async function getBuildDetailInternal(db: DbClient, build: Awaited<ReturnType<typeof getBuildById>>) {
  if (!build) {
    throw notFound("BUILD_NOT_FOUND", "Build not found.");
  }

  const [components, snapshot] = await Promise.all([
    listBuildComponents(db, build.id),
    getBuildEvaluationSnapshot(db, build.id),
  ]);
  const mappedComponents = await mapBuildComponentsToResponse(db, components);
  const evaluation = snapshot ? fromBuildEvaluationSnapshot(snapshot) : undefined;

  return {
    ...toBuildSummary(build),
    components: mappedComponents,
    evaluation,
  } satisfies BuildDetail;
}

export async function listUserBuilds(db: DbClient, userId: string) {
  const builds = await listBuildsForUser(db, userId);
  return builds.map(toBuildSummary);
}

export async function createUserBuild(
  db: DbClient,
  userId: string,
  input: { name: string; description?: string | null | undefined; visibility: "PRIVATE" | "UNLISTED" | "PUBLIC" },
) {
  const build = await createBuildRecord(db, {
    id: randomUUID(),
    userId,
    name: input.name,
    description: input.description ?? null,
    visibility: input.visibility,
  });

  return getBuildDetailInternal(db, build);
}

export async function getUserBuildDetail(db: DbClient, buildId: string, userId: string) {
  const build = await getUserBuildById(db, buildId, userId);
  if (!build) {
    throw notFound("BUILD_NOT_FOUND", "Build not found.");
  }
  return getBuildDetailInternal(db, build);
}

export async function updateUserBuild(
  db: DbClient,
  buildId: string,
  userId: string,
  input: { name?: string | undefined; description?: string | null | undefined; visibility?: "PRIVATE" | "UNLISTED" | "PUBLIC" | undefined },
) {
  const build = await getUserBuildById(db, buildId, userId);
  if (!build) {
    throw notFound("BUILD_NOT_FOUND", "Build not found.");
  }

  const updated = await updateBuildRecord(db, buildId, omitUndefined(input) as never);
  return getBuildDetailInternal(db, updated ?? build);
}

export async function deleteUserBuild(db: DbClient, buildId: string, userId: string) {
  const build = await getUserBuildById(db, buildId, userId);
  if (!build) {
    throw notFound("BUILD_NOT_FOUND", "Build not found.");
  }

  await deleteBuildRecord(db, buildId);
  return { success: true };
}

export async function upsertBuildComponent(
  db: DbClient,
  buildId: string,
  userId: string,
  categoryKey: string,
  input: { productId: string; quantity: number },
) {
  const build = await getUserBuildById(db, buildId, userId);
  if (!build) {
    throw notFound("BUILD_NOT_FOUND", "Build not found.");
  }

  const [product] = await getActiveProductsByIds(db, [input.productId]);
  if (!product) {
    throw badRequest("PRODUCT_NOT_FOUND", `Product ${input.productId} was not found.`);
  }
  if (product.categoryKey !== categoryKey) {
    throw badRequest("CATEGORY_MISMATCH", `Product ${input.productId} belongs to ${product.categoryKey}, not ${categoryKey}.`);
  }

  const existing = await getBuildComponentByCategory(db, buildId, categoryKey);
  if (existing) {
    await updateBuildComponentRecord(db, existing.id, {
      productId: input.productId,
      quantity: input.quantity,
    });
  } else {
    await createBuildComponentRecord(db, {
      id: randomUUID(),
      buildId,
      productId: input.productId,
      categoryKey,
      quantity: input.quantity,
    });
  }

  await recalculateBuildEvaluation(db, buildId);
  return getUserBuildDetail(db, buildId, userId);
}

export async function removeBuildComponent(db: DbClient, buildId: string, userId: string, categoryKey: string) {
  const build = await getUserBuildById(db, buildId, userId);
  if (!build) {
    throw notFound("BUILD_NOT_FOUND", "Build not found.");
  }

  await deleteBuildComponentRecord(db, buildId, categoryKey);
  const remaining = await listBuildComponents(db, buildId);
  if (remaining.length > 0) {
    await recalculateBuildEvaluation(db, buildId);
  } else {
    await deleteBuildEvaluationSnapshot(db, buildId);
  }
  return getUserBuildDetail(db, buildId, userId);
}

export async function duplicateBuild(db: DbClient, buildId: string, userId: string) {
  const original = await getUserBuildById(db, buildId, userId);
  if (!original) {
    throw notFound("BUILD_NOT_FOUND", "Build not found.");
  }

  const originalComponents = await listBuildComponents(db, buildId);
  const duplicate = (await createBuildRecord(db, {
    id: randomUUID(),
    userId,
    name: `${original.name} Copy`,
    description: original.description,
    visibility: original.visibility,
  }))!;

  for (const component of originalComponents) {
    await createBuildComponentRecord(db, {
      id: randomUUID(),
      buildId: duplicate.id,
      productId: component.productId,
      categoryKey: component.categoryKey,
      quantity: component.quantity,
    });
  }

  if (originalComponents.length > 0) {
    await recalculateBuildEvaluation(db, duplicate.id);
  }

  return getBuildDetailInternal(db, duplicate);
}

export async function getBuildCompatibilitySnapshot(db: DbClient, buildId: string, userId: string): Promise<CompatibilityEvaluation> {
  const build = await getUserBuildById(db, buildId, userId);
  if (!build) {
    throw notFound("BUILD_NOT_FOUND", "Build not found.");
  }

  const snapshot = await getBuildEvaluationSnapshot(db, buildId);
  if (snapshot) {
    return fromBuildEvaluationSnapshot(snapshot);
  }

  const components = await listBuildComponents(db, buildId);
  if (components.length === 0) {
    throw badRequest("BUILD_EMPTY", "Build has no components to evaluate.");
  }

  return recalculateBuildEvaluation(db, buildId);
}

export async function getSharedBuildDetail(db: DbClient, buildId: string) {
  const build = await getSharedBuildById(db, buildId);
  if (!build) {
    throw notFound("BUILD_NOT_FOUND", "Build not found.");
  }
  if (build.visibility === "PRIVATE") {
    throw forbidden("FORBIDDEN", "This build is private.");
  }
  return getBuildDetailInternal(db, build);
}
