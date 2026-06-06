import type { CategoryKey } from "./categories.js";
import type { ProductSummary } from "./products.js";

export const buildVisibilityValues = ["PRIVATE", "UNLISTED", "PUBLIC"] as const;

export type BuildVisibility = (typeof buildVisibilityValues)[number];

export interface BuildComponentSelection {
  category: CategoryKey;
  productId: string;
  quantity: number;
  product?: ProductSummary;
}

export interface BuildSummary {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  visibility: BuildVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface BuildDetail extends BuildSummary {
  components: BuildComponentSelection[];
}
