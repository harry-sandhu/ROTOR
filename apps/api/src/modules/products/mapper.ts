import type { ProductDetail, ProductSummary } from "@rotor/contracts";

type ProductSpecificationValue = ProductDetail["specifications"][number]["value"];

function parseNumericValue(value: string | null): number | null {
  return value === null ? null : Number(value);
}

function parseSpecificationValue(row: {
  dataType: string;
  numericValue: string | null;
  textValue: string | null;
  booleanValue: boolean | null;
  rangeMin: string | null;
  rangeMax: string | null;
  jsonValue: unknown;
}): ProductSpecificationValue {
  switch (row.dataType) {
    case "NUMBER":
      return parseNumericValue(row.numericValue);
    case "TEXT":
    case "ENUM":
      return row.textValue;
    case "BOOLEAN":
      return row.booleanValue;
    case "RANGE":
      return row.rangeMin !== null && row.rangeMax !== null
        ? { min: Number(row.rangeMin), max: Number(row.rangeMax) }
        : null;
    case "ARRAY":
      return Array.isArray(row.jsonValue) ? row.jsonValue : row.jsonValue === null ? null : [row.jsonValue];
    case "JSON":
      return row.jsonValue && typeof row.jsonValue === "object" && !Array.isArray(row.jsonValue)
        ? (row.jsonValue as Record<string, unknown>)
        : null;
    default:
      return (row.textValue ?? row.numericValue ?? null) as ProductSpecificationValue;
  }
}

export function mapProductSummary(
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    categoryKey: string;
    priceCents: number;
    stockQuantity: number;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    thumbnailUrl: string | null;
  },
  summarySpecs: Array<{
    specificationKey: string;
    label: string;
    value: string | null;
  }>,
): ProductSummary {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.categoryKey,
    priceCents: product.priceCents,
    stockQuantity: product.stockQuantity,
    status: product.status,
    thumbnailUrl: product.thumbnailUrl,
    summarySpecs: summarySpecs
      .filter((specification) => Boolean(specification.value))
      .map((specification) => ({
        key: specification.specificationKey,
        label: specification.label,
        value: specification.value!,
      })),
  };
}

export function mapProductDetail(input: {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    categoryKey: string;
    priceCents: number;
    stockQuantity: number;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    thumbnailUrl: string | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  summarySpecs: Array<{
    specificationKey: string;
    label: string;
    value: string | null;
  }>;
  images: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    sortOrder: number;
  }>;
  specifications: Array<{
    specificationKey: string;
    label: string;
    dataType: string;
    unit: string | null;
    numericValue: string | null;
    textValue: string | null;
    booleanValue: boolean | null;
    rangeMin: string | null;
    rangeMax: string | null;
    jsonValue: unknown;
    normalizedLabel: string | null;
  }>;
  alternativeProducts: ProductSummary[];
}): ProductDetail {
  return {
    ...mapProductSummary(input.product, input.summarySpecs),
    description: input.product.description,
    images: input.images,
    specifications: input.specifications.map((specification) => ({
      specificationKey: specification.specificationKey,
      label: specification.label,
      dataType: specification.dataType as ProductDetail["specifications"][number]["dataType"],
      unit: specification.unit,
      value: parseSpecificationValue(specification),
      normalizedLabel: specification.normalizedLabel,
    })),
    compatibilitySummary: [],
    alternativeProducts: input.alternativeProducts,
    createdAt: input.product.createdAt.toISOString(),
    updatedAt: input.product.updatedAt.toISOString(),
  };
}
