import { randomUUID } from "node:crypto";

import type { AdminProductImportInput, AdminProductInput, ProductDetail } from "@rotor/contracts";
import { normalizeSpecificationValue } from "@rotor/domain";
import type { DbClient, NewProductImage, NewProductSpecValue } from "@rotor/db";

import { badRequest, conflict, notFound } from "../../../lib/errors.js";

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}
import { validateProductSpecifications } from "../../validation/service.js";
import { mapProductDetail, mapProductSummary } from "../../products/mapper.js";
import { getProductSummarySpecs } from "../../products/repository.js";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProductById,
  getAdminProductBySlug,
  getSpecificationDefinitionsByKeys,
  listAdminProductImages,
  listAdminProducts,
  listAdminProductSpecValues,
  replaceAdminProductImages,
  replaceAdminProductSpecValues,
  updateAdminProduct,
} from "./repository.js";

function toProductImageRows(productId: string, images: NonNullable<AdminProductInput["images"]>): NewProductImage[] {
  return images.map((image, index) => ({
    id: randomUUID(),
    productId,
    imageUrl: image.imageUrl,
    altText: image.altText ?? null,
    sortOrder: image.sortOrder ?? index,
  }));
}

function toProductSpecValueRows(
  productId: string,
  definitions: Awaited<ReturnType<typeof getSpecificationDefinitionsByKeys>>,
  specs: Record<string, unknown>,
): NewProductSpecValue[] {
  const rows: NewProductSpecValue[] = [];

  for (const [key, rawValue] of Object.entries(specs)) {
    const definition = definitions.find((candidate) => candidate.key === key);
    if (!definition) {
      continue;
    }

    const normalized = normalizeSpecificationValue({
      dataType: definition.dataType,
      unit: definition.unit,
      value: rawValue,
    });

    rows.push({
      id: randomUUID(),
      productId,
      specificationId: definition.id,
      rawValue: JSON.stringify(rawValue),
      numericValue: typeof normalized.value === "number" ? normalized.value.toString() : null,
      textValue: typeof normalized.value === "string" ? normalized.value : null,
      booleanValue: typeof normalized.value === "boolean" ? normalized.value : null,
      rangeMin:
        typeof normalized.value === "object" && normalized.value !== null && "min" in normalized.value
          ? String(normalized.value.min)
          : null,
      rangeMax:
        typeof normalized.value === "object" && normalized.value !== null && "max" in normalized.value
          ? String(normalized.value.max)
          : null,
      jsonValue: typeof normalized.value === "object" && normalized.value !== null ? normalized.value : null,
      normalizedUnit: definition.unit,
      normalizedLabel: normalized.normalizedLabel,
    });
  }

  return rows;
}

async function mapAdminProductDetail(db: DbClient, productId: string): Promise<ProductDetail> {
  const product = await getAdminProductById(db, productId);
  if (!product) {
    throw notFound("PRODUCT_NOT_FOUND", "Product not found.");
  }

  const [summarySpecs, images, specifications] = await Promise.all([
    getProductSummarySpecs(db, [productId]),
    listAdminProductImages(db, productId),
    listAdminProductSpecValues(db, productId),
  ]);
  const groupedSummarySpecs = summarySpecs.reduce<Record<string, Array<{ specificationKey: string; label: string; value: string | null }>>>((accumulator, spec) => {
    const current = accumulator[spec.productId] ?? [];
    current.push({ specificationKey: spec.specificationKey, label: spec.label, value: spec.value });
    accumulator[spec.productId] = current;
    return accumulator;
  }, {});

  return mapProductDetail({
    product,
    summarySpecs: groupedSummarySpecs[product.id] ?? [],
    images,
    specifications,
    alternativeProducts: [],
  });
}

export async function listProductsForAdmin(db: DbClient) {
  const products = await listAdminProducts(db);
  const summarySpecs = await getProductSummarySpecs(
    db,
    products.map((product) => product.id),
  );
  const groupedSummarySpecs = summarySpecs.reduce<Record<string, Array<{ specificationKey: string; label: string; value: string | null }>>>((accumulator, spec) => {
    const current = accumulator[spec.productId] ?? [];
    current.push({ specificationKey: spec.specificationKey, label: spec.label, value: spec.value });
    accumulator[spec.productId] = current;
    return accumulator;
  }, {});

  return products.map((product) => mapProductSummary(product, groupedSummarySpecs[product.id] ?? []));
}

export async function getProductForAdmin(db: DbClient, productId: string) {
  return mapAdminProductDetail(db, productId);
}

export async function createProductForAdmin(db: DbClient, input: AdminProductInput) {
  const existing = await getAdminProductBySlug(db, input.slug);
  if (existing) {
    throw conflict("PRODUCT_SLUG_EXISTS", `Product slug ${input.slug} already exists.`);
  }

  const validation = await validateProductSpecifications(db, {
    categoryKey: input.categoryKey,
    specs: input.specs,
  });

  if (!validation.isValid) {
    throw badRequest("PRODUCT_VALIDATION_FAILED", "Product specification validation failed.", validation.issues);
  }

  const product = (await createAdminProduct(db, {
    id: randomUUID(),
    slug: input.slug,
    name: input.name,
    brand: input.brand,
    categoryKey: input.categoryKey,
    description: input.description ?? null,
    priceCents: input.priceCents,
    stockQuantity: input.stockQuantity,
    status: input.status,
    thumbnailUrl: input.thumbnailUrl ?? null,
  }))!;

  const definitions = await getSpecificationDefinitionsByKeys(db, Object.keys(input.specs));
  await replaceAdminProductSpecValues(db, product.id, toProductSpecValueRows(product.id, definitions, input.specs));
  await replaceAdminProductImages(db, product.id, toProductImageRows(product.id, input.images));

  return mapAdminProductDetail(db, product.id);
}

export async function updateProductForAdmin(
  db: DbClient,
  productId: string,
  input: Partial<AdminProductInput & Record<string, unknown>>,
) {
  const existing = await getAdminProductById(db, productId);
  if (!existing) {
    throw notFound("PRODUCT_NOT_FOUND", "Product not found.");
  }

  if (input.slug && input.slug !== existing.slug) {
    const duplicate = await getAdminProductBySlug(db, input.slug);
    if (duplicate) {
      throw conflict("PRODUCT_SLUG_EXISTS", `Product slug ${input.slug} already exists.`);
    }
  }

  const categoryKey = input.categoryKey ?? existing.categoryKey;
  const specs = input.specs ?? {};

  if (input.specs) {
    const validation = await validateProductSpecifications(db, {
      categoryKey,
      specs,
    });

    if (!validation.isValid) {
      throw badRequest("PRODUCT_VALIDATION_FAILED", "Product specification validation failed.", validation.issues);
    }

    const definitions = await getSpecificationDefinitionsByKeys(db, Object.keys(specs));
    await replaceAdminProductSpecValues(db, productId, toProductSpecValueRows(productId, definitions, specs));
  }

  if (input.images) {
    await replaceAdminProductImages(db, productId, toProductImageRows(productId, input.images));
  }

  const payload = omitUndefined({
    slug: input.slug,
    name: input.name,
    brand: input.brand,
    categoryKey: input.categoryKey,
    description: input.description ?? existing.description,
    priceCents: input.priceCents,
    stockQuantity: input.stockQuantity,
    status: input.status,
    thumbnailUrl: input.thumbnailUrl ?? existing.thumbnailUrl,
  }) as never;

  await updateAdminProduct(db, productId, payload);

  return mapAdminProductDetail(db, productId);
}

export async function deleteProductForAdmin(db: DbClient, productId: string) {
  const existing = await getAdminProductById(db, productId);
  if (!existing) {
    throw notFound("PRODUCT_NOT_FOUND", "Product not found.");
  }

  await deleteAdminProduct(db, productId);
  return { success: true };
}

export async function publishProductForAdmin(db: DbClient, productId: string) {
  const existing = await getAdminProductById(db, productId);
  if (!existing) {
    throw notFound("PRODUCT_NOT_FOUND", "Product not found.");
  }

  const specRows = await listAdminProductSpecValues(db, productId);
  const specs = Object.fromEntries(
    specRows.map((spec) => [
      spec.specificationKey,
      spec.dataType === "NUMBER"
        ? spec.numericValue === null
          ? null
          : Number(spec.numericValue)
        : spec.dataType === "BOOLEAN"
          ? spec.booleanValue
          : spec.dataType === "RANGE"
            ? spec.rangeMin !== null && spec.rangeMax !== null
              ? { min: Number(spec.rangeMin), max: Number(spec.rangeMax) }
              : null
            : spec.textValue ?? spec.jsonValue,
    ]),
  );

  const validation = await validateProductSpecifications(db, {
    categoryKey: existing.categoryKey,
    specs,
  });

  if (!validation.isValid) {
    throw badRequest("PRODUCT_VALIDATION_FAILED", "Product cannot be published until it passes validation.", validation.issues);
  }

  await updateAdminProduct(db, productId, { status: "ACTIVE" });
  return mapAdminProductDetail(db, productId);
}

export async function importProductsForAdmin(db: DbClient, input: AdminProductImportInput) {
  const results = [] as Array<{ slug: string; success: boolean; issues: { field: string; message: string }[] }>;

  for (const item of input.items) {
    const validation = await validateProductSpecifications(db, {
      categoryKey: item.categoryKey,
      specs: item.specs,
    });

    results.push({
      slug: item.slug,
      success: validation.isValid,
      issues: validation.issues,
    });
  }

  if (input.commit) {
    for (const item of input.items) {
      const existing = await getAdminProductBySlug(db, item.slug);
      if (existing) {
        await updateProductForAdmin(db, existing.id, item);
      } else {
        await createProductForAdmin(db, item);
      }
    }
  }

  return {
    commit: input.commit,
    results,
  };
}

export async function exportProductsForAdmin(db: DbClient) {
  const products = await listAdminProducts(db);
  return Promise.all(products.map((product) => mapAdminProductDetail(db, product.id)));
}
