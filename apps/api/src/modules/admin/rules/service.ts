import { randomUUID } from "node:crypto";

import type { AdminCompatibilityRuleInput } from "@rotor/contracts";
import type { DbClient } from "@rotor/db";

import { badRequest, conflict, notFound } from "../../../lib/errors.js";

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}
import { validateRuleReferences } from "../../validation/service.js";
import {
  createAdminRule,
  deleteAdminRule,
  getAdminRuleById,
  getAdminRuleByKey,
  getSpecificationDefinitionsByKeys,
  listAdminRules,
  updateAdminRule,
} from "./repository.js";

async function resolveSpecificationIds(db: DbClient, input: AdminCompatibilityRuleInput) {
  const specRows = await getSpecificationDefinitionsByKeys(db, [input.leftSpecificationKey, input.rightSpecificationKey]);
  const specByKey = new Map(specRows.map((row) => [row.key, row.id]));

  const leftSpecificationId = specByKey.get(input.leftSpecificationKey);
  const rightSpecificationId = specByKey.get(input.rightSpecificationKey);

  if (!leftSpecificationId || !rightSpecificationId) {
    throw badRequest("SPECIFICATION_NOT_FOUND", "One or more referenced specifications do not exist.");
  }

  return { leftSpecificationId, rightSpecificationId };
}

export async function listRules(db: DbClient) {
  return listAdminRules(db);
}

export async function createRule(db: DbClient, input: AdminCompatibilityRuleInput) {
  const existing = await getAdminRuleByKey(db, input.key);
  if (existing) {
    throw conflict("RULE_KEY_EXISTS", `Rule key ${input.key} already exists.`);
  }

  const validation = await validateRuleReferences(db, {
    fromCategoryKey: input.fromCategoryKey,
    toCategoryKey: input.toCategoryKey,
    leftSpecificationKey: input.leftSpecificationKey,
    rightSpecificationKey: input.rightSpecificationKey,
  });

  if (!validation.isValid) {
    throw badRequest("RULE_INVALID", "Compatibility rule references are invalid.", validation.issues);
  }

  const { leftSpecificationId, rightSpecificationId } = await resolveSpecificationIds(db, input);

  return createAdminRule(db, {
    id: randomUUID(),
    key: input.key,
    name: input.name,
    description: input.description ?? null,
    fromCategoryKey: input.fromCategoryKey,
    toCategoryKey: input.toCategoryKey,
    leftSpecificationId,
    operator: input.operator,
    rightSpecificationId,
    severityOnFail: input.severityOnFail,
    successMessageTemplate: input.successMessageTemplate ?? null,
    failureMessageTemplate: input.failureMessageTemplate,
    warningThresholdJson: input.warningThreshold ?? null,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  });
}

export async function updateRule(
  db: DbClient,
  ruleId: string,
  input: Partial<AdminCompatibilityRuleInput & Record<string, unknown>>,
) {
  const existing = await getAdminRuleById(db, ruleId);
  if (!existing) {
    throw notFound("RULE_NOT_FOUND", "Compatibility rule not found.");
  }

  if (input.key && input.key !== existing.key) {
    const duplicate = await getAdminRuleByKey(db, input.key);
    if (duplicate) {
      throw conflict("RULE_KEY_EXISTS", `Rule key ${input.key} already exists.`);
    }
  }

  const merged = {
    key: input.key ?? existing.key,
    name: input.name ?? existing.name,
    description: input.description ?? existing.description,
    fromCategoryKey: input.fromCategoryKey ?? existing.fromCategoryKey,
    toCategoryKey: input.toCategoryKey ?? existing.toCategoryKey,
    leftSpecificationKey: input.leftSpecificationKey ?? "",
    operator: input.operator ?? existing.operator,
    rightSpecificationKey: input.rightSpecificationKey ?? "",
    severityOnFail: input.severityOnFail ?? existing.severityOnFail,
    successMessageTemplate: input.successMessageTemplate ?? existing.successMessageTemplate,
    failureMessageTemplate: input.failureMessageTemplate ?? existing.failureMessageTemplate,
    warningThreshold: input.warningThreshold ?? existing.warningThresholdJson,
    isActive: input.isActive ?? existing.isActive,
    sortOrder: input.sortOrder ?? existing.sortOrder,
  };

  const wantsSpecRewire = Boolean(input.leftSpecificationKey || input.rightSpecificationKey || input.fromCategoryKey || input.toCategoryKey);

  let resolvedSpecIds: { leftSpecificationId?: string; rightSpecificationId?: string } = {};

  if (wantsSpecRewire) {
    if (!input.leftSpecificationKey || !input.rightSpecificationKey) {
      throw badRequest(
        "RULE_SPEC_KEYS_REQUIRED",
        "Updating rule category/spec references requires both leftSpecificationKey and rightSpecificationKey.",
      );
    }

    const validation = await validateRuleReferences(db, {
      fromCategoryKey: merged.fromCategoryKey,
      toCategoryKey: merged.toCategoryKey,
      leftSpecificationKey: input.leftSpecificationKey,
      rightSpecificationKey: input.rightSpecificationKey,
    });

    if (!validation.isValid) {
      throw badRequest("RULE_INVALID", "Compatibility rule references are invalid.", validation.issues);
    }

    resolvedSpecIds = await resolveSpecificationIds(db, {
      key: merged.key,
      name: merged.name,
      description: merged.description,
      fromCategoryKey: merged.fromCategoryKey,
      toCategoryKey: merged.toCategoryKey,
      leftSpecificationKey: input.leftSpecificationKey,
      operator: merged.operator,
      rightSpecificationKey: input.rightSpecificationKey,
      severityOnFail: merged.severityOnFail,
      successMessageTemplate: merged.successMessageTemplate,
      failureMessageTemplate: merged.failureMessageTemplate,
      warningThreshold: merged.warningThreshold,
      isActive: merged.isActive,
      sortOrder: merged.sortOrder,
    });
  }

  const payload = omitUndefined({
    key: input.key,
    name: input.name,
    description: input.description ?? existing.description,
    fromCategoryKey: input.fromCategoryKey,
    toCategoryKey: input.toCategoryKey,
    leftSpecificationId: resolvedSpecIds.leftSpecificationId,
    operator: input.operator,
    rightSpecificationId: resolvedSpecIds.rightSpecificationId,
    severityOnFail: input.severityOnFail,
    successMessageTemplate: input.successMessageTemplate ?? existing.successMessageTemplate,
    failureMessageTemplate: input.failureMessageTemplate,
    warningThresholdJson: input.warningThreshold ?? existing.warningThresholdJson,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  }) as never;

  return updateAdminRule(db, ruleId, payload);
}

export async function removeRule(db: DbClient, ruleId: string) {
  const existing = await getAdminRuleById(db, ruleId);
  if (!existing) {
    throw notFound("RULE_NOT_FOUND", "Compatibility rule not found.");
  }

  await deleteAdminRule(db, ruleId);
  return { success: true };
}
