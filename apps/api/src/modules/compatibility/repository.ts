import { alias } from "drizzle-orm/pg-core";
import { and, eq, inArray } from "drizzle-orm";

import {
  compatibilityRuleDefinitions,
  products,
  productSpecValues,
  specificationDefinitions,
  type DbClient,
} from "@rotor/db";

export async function getActiveProductsByIds(db: DbClient, productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      brand: products.brand,
      categoryKey: products.categoryKey,
      description: products.description,
      priceCents: products.priceCents,
      stockQuantity: products.stockQuantity,
      status: products.status,
      thumbnailUrl: products.thumbnailUrl,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(and(inArray(products.id, productIds), eq(products.status, "ACTIVE")));
}

export async function getSpecificationsForProducts(db: DbClient, productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return db
    .select({
      productId: productSpecValues.productId,
      specificationKey: specificationDefinitions.key,
      dataType: specificationDefinitions.dataType,
      unit: specificationDefinitions.unit,
      numericValue: productSpecValues.numericValue,
      textValue: productSpecValues.textValue,
      booleanValue: productSpecValues.booleanValue,
      rangeMin: productSpecValues.rangeMin,
      rangeMax: productSpecValues.rangeMax,
      jsonValue: productSpecValues.jsonValue,
      normalizedLabel: productSpecValues.normalizedLabel,
    })
    .from(productSpecValues)
    .innerJoin(
      specificationDefinitions,
      eq(productSpecValues.specificationId, specificationDefinitions.id),
    )
    .where(inArray(productSpecValues.productId, productIds));
}

export async function getCompatibilityRulesForCategories(db: DbClient, categoryKeys: string[]) {
  if (categoryKeys.length === 0) {
    return [];
  }

  const leftSpecifications = alias(specificationDefinitions, "left_specifications");
  const rightSpecifications = alias(specificationDefinitions, "right_specifications");

  return db
    .select({
      key: compatibilityRuleDefinitions.key,
      fromCategoryKey: compatibilityRuleDefinitions.fromCategoryKey,
      toCategoryKey: compatibilityRuleDefinitions.toCategoryKey,
      operator: compatibilityRuleDefinitions.operator,
      severityOnFail: compatibilityRuleDefinitions.severityOnFail,
      successMessageTemplate: compatibilityRuleDefinitions.successMessageTemplate,
      failureMessageTemplate: compatibilityRuleDefinitions.failureMessageTemplate,
      warningThresholdJson: compatibilityRuleDefinitions.warningThresholdJson,
      leftSpecificationKey: leftSpecifications.key,
      rightSpecificationKey: rightSpecifications.key,
    })
    .from(compatibilityRuleDefinitions)
    .innerJoin(
      leftSpecifications,
      eq(compatibilityRuleDefinitions.leftSpecificationId, leftSpecifications.id),
    )
    .innerJoin(
      rightSpecifications,
      eq(compatibilityRuleDefinitions.rightSpecificationId, rightSpecifications.id),
    )
    .where(
      and(
        eq(compatibilityRuleDefinitions.isActive, true),
        inArray(compatibilityRuleDefinitions.fromCategoryKey, categoryKeys),
        inArray(compatibilityRuleDefinitions.toCategoryKey, categoryKeys),
      ),
    );
}
