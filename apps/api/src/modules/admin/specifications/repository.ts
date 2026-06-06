import { asc, eq } from "drizzle-orm";

import { specificationDefinitions, type DbClient, type NewSpecificationDefinition } from "@rotor/db";

export async function listAdminSpecificationDefinitions(db: DbClient) {
  return db.select().from(specificationDefinitions).orderBy(asc(specificationDefinitions.name));
}

export async function getAdminSpecificationDefinitionById(db: DbClient, specificationId: string) {
  const [definition] = await db
    .select()
    .from(specificationDefinitions)
    .where(eq(specificationDefinitions.id, specificationId))
    .limit(1);

  return definition;
}

export async function getAdminSpecificationDefinitionByKey(db: DbClient, key: string) {
  const [definition] = await db
    .select()
    .from(specificationDefinitions)
    .where(eq(specificationDefinitions.key, key))
    .limit(1);

  return definition;
}

export async function createAdminSpecificationDefinition(db: DbClient, input: NewSpecificationDefinition) {
  const [definition] = await db.insert(specificationDefinitions).values(input).returning();
  return definition;
}

export async function updateAdminSpecificationDefinition(
  db: DbClient,
  specificationId: string,
  input: Partial<Omit<NewSpecificationDefinition, "id">>,
) {
  const [definition] = await db
    .update(specificationDefinitions)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(specificationDefinitions.id, specificationId))
    .returning();

  return definition;
}

export async function deleteAdminSpecificationDefinition(db: DbClient, specificationId: string) {
  await db.delete(specificationDefinitions).where(eq(specificationDefinitions.id, specificationId));
}
