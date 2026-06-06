import { and, asc, eq } from "drizzle-orm";

import {
  buildComponents,
  buildEvaluations,
  builds,
  products,
  type DbClient,
  type NewBuild,
  type NewBuildComponent,
  type NewBuildEvaluation,
} from "@rotor/db";

export async function listBuildsForUser(db: DbClient, userId: string) {
  return db.select().from(builds).where(eq(builds.userId, userId)).orderBy(asc(builds.createdAt));
}

export async function getBuildById(db: DbClient, buildId: string) {
  const [build] = await db.select().from(builds).where(eq(builds.id, buildId)).limit(1);
  return build;
}

export async function getUserBuildById(db: DbClient, buildId: string, userId: string) {
  const [build] = await db.select().from(builds).where(and(eq(builds.id, buildId), eq(builds.userId, userId))).limit(1);
  return build;
}

export async function getSharedBuildById(db: DbClient, buildId: string) {
  const [build] = await db
    .select()
    .from(builds)
    .where(and(eq(builds.id, buildId)))
    .limit(1);
  return build;
}

export async function createBuildRecord(db: DbClient, input: NewBuild) {
  const [build] = await db.insert(builds).values(input).returning();
  return build;
}

export async function updateBuildRecord(
  db: DbClient,
  buildId: string,
  input: Partial<Pick<NewBuild, "name" | "description" | "visibility">>,
) {
  const [build] = await db
    .update(builds)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(builds.id, buildId))
    .returning();
  return build;
}

export async function deleteBuildRecord(db: DbClient, buildId: string) {
  await db.delete(builds).where(eq(builds.id, buildId));
}

export async function listBuildComponents(db: DbClient, buildId: string) {
  return db
    .select({
      id: buildComponents.id,
      buildId: buildComponents.buildId,
      productId: buildComponents.productId,
      categoryKey: buildComponents.categoryKey,
      quantity: buildComponents.quantity,
      createdAt: buildComponents.createdAt,
      updatedAt: buildComponents.updatedAt,
      productName: products.name,
      productSlug: products.slug,
      productBrand: products.brand,
      productCategoryKey: products.categoryKey,
      productPriceCents: products.priceCents,
      productStockQuantity: products.stockQuantity,
      productStatus: products.status,
      productThumbnailUrl: products.thumbnailUrl,
    })
    .from(buildComponents)
    .innerJoin(products, eq(buildComponents.productId, products.id))
    .where(eq(buildComponents.buildId, buildId))
    .orderBy(asc(buildComponents.createdAt));
}

export async function getBuildComponentByCategory(db: DbClient, buildId: string, categoryKey: string) {
  const [component] = await db
    .select()
    .from(buildComponents)
    .where(and(eq(buildComponents.buildId, buildId), eq(buildComponents.categoryKey, categoryKey)))
    .limit(1);
  return component;
}

export async function createBuildComponentRecord(db: DbClient, input: NewBuildComponent) {
  const [component] = await db.insert(buildComponents).values(input).returning();
  return component;
}

export async function updateBuildComponentRecord(
  db: DbClient,
  componentId: string,
  input: Partial<Pick<NewBuildComponent, "productId" | "quantity">>,
) {
  const [component] = await db
    .update(buildComponents)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(buildComponents.id, componentId))
    .returning();
  return component;
}

export async function deleteBuildComponentRecord(db: DbClient, buildId: string, categoryKey: string) {
  await db.delete(buildComponents).where(and(eq(buildComponents.buildId, buildId), eq(buildComponents.categoryKey, categoryKey)));
}

export async function getBuildEvaluationSnapshot(db: DbClient, buildId: string) {
  const [snapshot] = await db.select().from(buildEvaluations).where(eq(buildEvaluations.buildId, buildId)).limit(1);
  return snapshot;
}

export async function deleteBuildEvaluationSnapshot(db: DbClient, buildId: string) {
  await db.delete(buildEvaluations).where(eq(buildEvaluations.buildId, buildId));
}

export async function saveBuildEvaluationSnapshot(db: DbClient, input: NewBuildEvaluation) {
  const existing = await getBuildEvaluationSnapshot(db, input.buildId);

  if (existing) {
    const [snapshot] = await db
      .update(buildEvaluations)
      .set({
        compatibilityScore: input.compatibilityScore,
        validationStatus: input.validationStatus,
        totalCostCents: input.totalCostCents,
        missingCategories: input.missingCategories,
        warnings: input.warnings,
        issues: input.issues,
        evaluatedAt: new Date(),
      })
      .where(eq(buildEvaluations.buildId, input.buildId))
      .returning();

    return snapshot;
  }

  const [snapshot] = await db.insert(buildEvaluations).values(input).returning();
  return snapshot;
}
