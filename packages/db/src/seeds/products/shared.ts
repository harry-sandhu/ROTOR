import type { NewProduct, NewProductImage } from "../../schema/catalog.js";
import type { NewProductSpecValue } from "../../schema/specifications.js";
import {
  getSpecificationDefinition,
  getSpecificationDefinitionId,
  type SpecificationKey,
} from "../specification-definitions.seed.js";
import {
  createPlaceholderImageUrl,
  isSeedNumericRange,
  rangeLabel,
  scalarLabel,
  stableUuid,
  toDbNumeric,
  type SeedNumericRange,
} from "../shared.js";

export type SeedSpecInput = number | string | boolean | null | SeedNumericRange | readonly unknown[] | Record<string, unknown>;

export interface SeedProductInput {
  slug: string;
  name: string;
  brand: string;
  categoryKey: string;
  description: string;
  priceCents: number;
  stockQuantity: number;
  thumbnailLabel?: string;
  specs: Partial<Record<SpecificationKey, SeedSpecInput>>;
}

export interface SeedProductBundle {
  product: NewProduct;
  images: NewProductImage[];
  specValues: NewProductSpecValue[];
}

function createProductImage(productId: string, label: string): NewProductImage {
  return {
    id: stableUuid(`image:${productId}:primary`),
    productId,
    imageUrl: createPlaceholderImageUrl(label),
    altText: label,
    sortOrder: 1,
  };
}

function createSpecValue(productId: string, specificationKey: SpecificationKey, value: SeedSpecInput): NewProductSpecValue {
  const definition = getSpecificationDefinition(specificationKey);
  const commonFields = {
    id: stableUuid(`product-spec:${productId}:${specificationKey}`),
    productId,
    specificationId: getSpecificationDefinitionId(specificationKey),
  } as const;

  if (value === null) {
    return {
      ...commonFields,
      rawValue: "null",
      numericValue: null,
      textValue: null,
      booleanValue: null,
      rangeMin: null,
      rangeMax: null,
      jsonValue: null,
      normalizedUnit: definition.unit,
      normalizedLabel: null,
    };
  }

  if (typeof value === "number") {
    return {
      ...commonFields,
      rawValue: value.toString(),
      numericValue: toDbNumeric(value),
      textValue: null,
      booleanValue: null,
      rangeMin: null,
      rangeMax: null,
      jsonValue: null,
      normalizedUnit: definition.unit,
      normalizedLabel: scalarLabel(value, definition.unit),
    };
  }

  if (typeof value === "string") {
    return {
      ...commonFields,
      rawValue: value,
      numericValue: null,
      textValue: value,
      booleanValue: null,
      rangeMin: null,
      rangeMax: null,
      jsonValue: null,
      normalizedUnit: definition.unit,
      normalizedLabel: scalarLabel(value, definition.unit),
    };
  }

  if (typeof value === "boolean") {
    return {
      ...commonFields,
      rawValue: value.toString(),
      numericValue: null,
      textValue: null,
      booleanValue: value,
      rangeMin: null,
      rangeMax: null,
      jsonValue: null,
      normalizedUnit: definition.unit,
      normalizedLabel: scalarLabel(value, definition.unit),
    };
  }

  if (Array.isArray(value)) {
    return {
      ...commonFields,
      rawValue: JSON.stringify(value),
      numericValue: null,
      textValue: null,
      booleanValue: null,
      rangeMin: null,
      rangeMax: null,
      jsonValue: value,
      normalizedUnit: definition.unit,
      normalizedLabel: JSON.stringify(value),
    };
  }

  if (isSeedNumericRange(value)) {
    return {
      ...commonFields,
      rawValue: JSON.stringify(value),
      numericValue: null,
      textValue: null,
      booleanValue: null,
      rangeMin: toDbNumeric(value.min),
      rangeMax: toDbNumeric(value.max),
      jsonValue: value,
      normalizedUnit: definition.unit,
      normalizedLabel: rangeLabel(value.min, value.max, definition.unit),
    };
  }

  return {
    ...commonFields,
    rawValue: JSON.stringify(value),
    numericValue: null,
    textValue: null,
    booleanValue: null,
    rangeMin: null,
    rangeMax: null,
    jsonValue: value,
    normalizedUnit: definition.unit,
    normalizedLabel: JSON.stringify(value),
  };
}

export function createSeedProductBundle(input: SeedProductInput): SeedProductBundle {
  const productId = stableUuid(`product:${input.slug}`);
  const thumbnailLabel = input.thumbnailLabel ?? input.name;
  const thumbnailUrl = createPlaceholderImageUrl(thumbnailLabel);

  const product: NewProduct = {
    id: productId,
    slug: input.slug,
    name: input.name,
    brand: input.brand,
    categoryKey: input.categoryKey,
    description: input.description,
    priceCents: input.priceCents,
    stockQuantity: input.stockQuantity,
    status: "ACTIVE",
    thumbnailUrl,
  };

  const images = [createProductImage(productId, thumbnailLabel)];
  const specValues = Object.entries(input.specs).map(([specificationKey, value]) =>
    createSpecValue(productId, specificationKey as SpecificationKey, value as SeedSpecInput),
  );

  return {
    product,
    images,
    specValues,
  };
}

export function flattenProductBundles(bundles: SeedProductBundle[]) {
  return {
    products: bundles.map((bundle) => bundle.product),
    images: bundles.flatMap((bundle) => bundle.images),
    specValues: bundles.flatMap((bundle) => bundle.specValues),
  };
}
