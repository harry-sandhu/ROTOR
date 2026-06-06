import { and, asc, eq, inArray } from "drizzle-orm";

import {
  categorySpecifications,
  productImages,
  products,
  productSpecValues,
  specificationDefinitions,
  type DbClient,
  type NewProduct,
  type NewProductImage,
  type NewProductSpecValue,
} from "@rotor/db";

export async function listAdminProducts(db: DbClient) {
  return db.select().from(products).orderBy(asc(products.categoryKey), asc(products.brand), asc(products.name));
}

export async function getAdminProductById(db: DbClient, productId: string) {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return product;
}

export async function getAdminProductBySlug(db: DbClient, slug: string) {
  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return product;
}

export async function createAdminProduct(db: DbClient, input: NewProduct) {
  const [product] = await db.insert(products).values(input).returning();
  return product;
}

export async function updateAdminProduct(
  db: DbClient,
  productId: string,
  input: Partial<Omit<NewProduct, "id">>,
) {
  const [product] = await db
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(products.id, productId))
    .returning();
  return product;
}

export async function deleteAdminProduct(db: DbClient, productId: string) {
  await db.delete(products).where(eq(products.id, productId));
}

export async function listAdminProductImages(db: DbClient, productId: string) {
  return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder));
}

export async function replaceAdminProductImages(db: DbClient, productId: string, images: NewProductImage[]) {
  await db.delete(productImages).where(eq(productImages.productId, productId));
  if (images.length > 0) {
    await db.insert(productImages).values(images);
  }
}

export async function replaceAdminProductSpecValues(db: DbClient, productId: string, values: NewProductSpecValue[]) {
  await db.delete(productSpecValues).where(eq(productSpecValues.productId, productId));
  if (values.length > 0) {
    await db.insert(productSpecValues).values(values);
  }
}

export async function getCategorySpecificationDefinitions(db: DbClient, categoryKey: string) {
  return db
    .select({
      id: specificationDefinitions.id,
      key: specificationDefinitions.key,
      name: specificationDefinitions.name,
      dataType: specificationDefinitions.dataType,
      unit: specificationDefinitions.unit,
      validation: specificationDefinitions.validationJson,
      isRequired: categorySpecifications.isRequired,
    })
    .from(categorySpecifications)
    .innerJoin(
      specificationDefinitions,
      eq(categorySpecifications.specificationId, specificationDefinitions.id),
    )
    .where(eq(categorySpecifications.categoryKey, categoryKey))
    .orderBy(asc(categorySpecifications.sortOrder), asc(specificationDefinitions.name));
}

export async function getSpecificationDefinitionsByKeys(db: DbClient, keys: string[]) {
  if (keys.length === 0) {
    return [];
  }

  return db
    .select({
      id: specificationDefinitions.id,
      key: specificationDefinitions.key,
      name: specificationDefinitions.name,
      dataType: specificationDefinitions.dataType,
      unit: specificationDefinitions.unit,
      validation: specificationDefinitions.validationJson,
    })
    .from(specificationDefinitions)
    .where(inArray(specificationDefinitions.key, keys));
}

export async function listAdminProductSpecValues(db: DbClient, productId: string) {
  return db
    .select({
      specificationKey: specificationDefinitions.key,
      label: specificationDefinitions.name,
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
    .where(eq(productSpecValues.productId, productId));
}
