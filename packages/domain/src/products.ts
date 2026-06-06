import type { CategoryKey } from "./categories.js";

export const productStatusValues = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export type ProductStatus = (typeof productStatusValues)[number];

export interface ProductSpecificationSummary {
  key: string;
  label: string;
  value: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryKey;
  priceCents: number;
  stockQuantity: number;
  status: ProductStatus;
  thumbnailUrl: string | null;
  summarySpecs: ProductSpecificationSummary[];
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}
