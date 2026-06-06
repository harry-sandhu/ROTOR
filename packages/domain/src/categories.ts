export const mvpCategoryKeys = ["FRAME", "MOTOR", "ESC", "BATTERY", "PROPELLER"] as const;

export type MvpCategoryKey = (typeof mvpCategoryKeys)[number];
export type CategoryKey = MvpCategoryKey | (string & {});

export interface CategoryDefinition {
  key: CategoryKey;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CategorySummary {
  key: CategoryKey;
  name: string;
}

export const builderCategoryOrder: readonly MvpCategoryKey[] = mvpCategoryKeys;
