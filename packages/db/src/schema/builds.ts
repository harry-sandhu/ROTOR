import { index, integer, jsonb, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

import { users } from "./auth.js";
import { categories, products } from "./catalog.js";

export const buildVisibilityValues = ["PRIVATE", "UNLISTED", "PUBLIC"] as const;
export const buildValidationStatusValues = ["INCOMPLETE", "VALID", "VALID_WITH_WARNINGS", "INVALID"] as const;

export type BuildVisibility = (typeof buildVisibilityValues)[number];
export type BuildValidationStatus = (typeof buildValidationStatusValues)[number];

export const builds = pgTable(
  "builds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    description: text("description"),
    visibility: text("visibility").$type<BuildVisibility>().notNull().default("PRIVATE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("builds_user_idx").on(table.userId), index("builds_visibility_idx").on(table.visibility)],
);

export const buildComponents = pgTable(
  "build_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    buildId: uuid("build_id")
      .notNull()
      .references(() => builds.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    categoryKey: text("category_key")
      .notNull()
      .references(() => categories.key, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("build_components_build_category_unique_idx").on(table.buildId, table.categoryKey),
    index("build_components_product_idx").on(table.productId),
  ],
);

export const buildEvaluations = pgTable(
  "build_evaluations",
  {
    buildId: uuid("build_id")
      .primaryKey()
      .references(() => builds.id, { onDelete: "cascade" }),
    compatibilityScore: integer("compatibility_score").notNull(),
    validationStatus: text("validation_status").$type<BuildValidationStatus>().notNull(),
    totalCostCents: integer("total_cost_cents").notNull(),
    missingCategories: jsonb("missing_categories").$type<string[]>().notNull(),
    warnings: jsonb("warnings").$type<Record<string, unknown>[]>().notNull(),
    issues: jsonb("issues").$type<Record<string, unknown>[]>().notNull(),
    evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("build_evaluations_status_idx").on(table.validationStatus)],
);

export type Build = typeof builds.$inferSelect;
export type NewBuild = typeof builds.$inferInsert;
export type BuildComponent = typeof buildComponents.$inferSelect;
export type NewBuildComponent = typeof buildComponents.$inferInsert;
export type BuildEvaluation = typeof buildEvaluations.$inferSelect;
export type NewBuildEvaluation = typeof buildEvaluations.$inferInsert;
