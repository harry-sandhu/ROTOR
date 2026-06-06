import { asc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  compatibilityRuleDefinitions,
  specificationDefinitions,
  type DbClient,
  type NewCompatibilityRuleDefinition,
} from "@rotor/db";

export async function listAdminRules(db: DbClient) {
  const leftSpecs = alias(specificationDefinitions, "admin_rule_left_specs");
  const rightSpecs = alias(specificationDefinitions, "admin_rule_right_specs");

  return db
    .select({
      id: compatibilityRuleDefinitions.id,
      key: compatibilityRuleDefinitions.key,
      name: compatibilityRuleDefinitions.name,
      description: compatibilityRuleDefinitions.description,
      fromCategoryKey: compatibilityRuleDefinitions.fromCategoryKey,
      toCategoryKey: compatibilityRuleDefinitions.toCategoryKey,
      leftSpecificationId: compatibilityRuleDefinitions.leftSpecificationId,
      leftSpecificationKey: leftSpecs.key,
      operator: compatibilityRuleDefinitions.operator,
      rightSpecificationId: compatibilityRuleDefinitions.rightSpecificationId,
      rightSpecificationKey: rightSpecs.key,
      severityOnFail: compatibilityRuleDefinitions.severityOnFail,
      successMessageTemplate: compatibilityRuleDefinitions.successMessageTemplate,
      failureMessageTemplate: compatibilityRuleDefinitions.failureMessageTemplate,
      warningThresholdJson: compatibilityRuleDefinitions.warningThresholdJson,
      isActive: compatibilityRuleDefinitions.isActive,
      sortOrder: compatibilityRuleDefinitions.sortOrder,
      createdAt: compatibilityRuleDefinitions.createdAt,
      updatedAt: compatibilityRuleDefinitions.updatedAt,
    })
    .from(compatibilityRuleDefinitions)
    .innerJoin(leftSpecs, eq(compatibilityRuleDefinitions.leftSpecificationId, leftSpecs.id))
    .innerJoin(rightSpecs, eq(compatibilityRuleDefinitions.rightSpecificationId, rightSpecs.id))
    .orderBy(asc(compatibilityRuleDefinitions.sortOrder), asc(compatibilityRuleDefinitions.name));
}

export async function getAdminRuleById(db: DbClient, ruleId: string) {
  const [rule] = await db.select().from(compatibilityRuleDefinitions).where(eq(compatibilityRuleDefinitions.id, ruleId)).limit(1);
  return rule;
}

export async function getAdminRuleByKey(db: DbClient, key: string) {
  const [rule] = await db.select().from(compatibilityRuleDefinitions).where(eq(compatibilityRuleDefinitions.key, key)).limit(1);
  return rule;
}

export async function getSpecificationDefinitionsByKeys(db: DbClient, keys: string[]) {
  if (keys.length === 0) {
    return [];
  }

  return db
    .select({ id: specificationDefinitions.id, key: specificationDefinitions.key })
    .from(specificationDefinitions)
    .where(inArray(specificationDefinitions.key, keys));
}

export async function createAdminRule(db: DbClient, input: NewCompatibilityRuleDefinition) {
  const [rule] = await db.insert(compatibilityRuleDefinitions).values(input).returning();
  return rule;
}

export async function updateAdminRule(
  db: DbClient,
  ruleId: string,
  input: Partial<Omit<NewCompatibilityRuleDefinition, "id">>,
) {
  const [rule] = await db
    .update(compatibilityRuleDefinitions)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(compatibilityRuleDefinitions.id, ruleId))
    .returning();
  return rule;
}

export async function deleteAdminRule(db: DbClient, ruleId: string) {
  await db.delete(compatibilityRuleDefinitions).where(eq(compatibilityRuleDefinitions.id, ruleId));
}
