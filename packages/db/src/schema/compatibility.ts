import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

import { categories } from "./catalog.js";
import { specificationDefinitions } from "./specifications.js";

export const ruleOperatorValues = ["EQ", "NEQ", "GTE", "LTE", "RANGE_CONTAINS", "RANGE_OVERLAPS", "ARRAY_CONTAINS", "ARRAY_OVERLAPS"] as const;
export const ruleFailureSeverityValues = ["WARNING", "INCOMPATIBLE"] as const;

export type RuleOperator = (typeof ruleOperatorValues)[number];
export type RuleFailureSeverity = (typeof ruleFailureSeverityValues)[number];

export const compatibilityRuleDefinitions = pgTable(
  "compatibility_rule_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    fromCategoryKey: text("from_category_key")
      .notNull()
      .references(() => categories.key, { onDelete: "restrict" }),
    toCategoryKey: text("to_category_key")
      .notNull()
      .references(() => categories.key, { onDelete: "restrict" }),
    leftSpecificationId: uuid("left_specification_id")
      .notNull()
      .references(() => specificationDefinitions.id, { onDelete: "restrict" }),
    operator: text("operator").$type<RuleOperator>().notNull(),
    rightSpecificationId: uuid("right_specification_id")
      .notNull()
      .references(() => specificationDefinitions.id, { onDelete: "restrict" }),
    severityOnFail: text("severity_on_fail").$type<RuleFailureSeverity>().notNull(),
    successMessageTemplate: text("success_message_template"),
    failureMessageTemplate: text("failure_message_template").notNull(),
    warningThresholdJson: jsonb("warning_threshold_json").$type<Record<string, unknown>>(),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("compatibility_rule_definitions_key_unique_idx").on(table.key),
    index("compatibility_rule_definitions_category_pair_idx").on(table.fromCategoryKey, table.toCategoryKey, table.isActive),
  ],
);

export type CompatibilityRuleDefinition = typeof compatibilityRuleDefinitions.$inferSelect;
export type NewCompatibilityRuleDefinition = typeof compatibilityRuleDefinitions.$inferInsert;
