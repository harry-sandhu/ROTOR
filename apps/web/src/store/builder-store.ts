import { createContext, useContext } from "react";

export interface BuilderSelection {
  productId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    brand: string;
    category: string;
    priceCents: number;
    thumbnailUrl: string | null;
    summarySpecs: Array<{ key: string; label: string; value: string }>;
  };
}

export interface BuilderEvaluation {
  overallStatus: "COMPATIBLE" | "WARNING" | "INCOMPATIBLE";
  validationStatus: "INCOMPLETE" | "VALID" | "VALID_WITH_WARNINGS" | "INVALID";
  score: number;
  totalCostCents: number;
  missingCategories: string[];
  issues: Array<{ status: "WARNING" | "INCOMPATIBLE"; message: string }>;
}

export interface BuilderStateValue {
  selections: Record<string, BuilderSelection>;
  activeCategory: string | null;
  evaluation: BuilderEvaluation | null;
}

export const BuilderStateContext = createContext<BuilderStateValue | null>(null);

export function useBuilderStateContext() {
  return useContext(BuilderStateContext);
}
