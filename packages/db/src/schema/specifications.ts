import { boolean, index, integer, jsonb, numeric, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

import { categories, products } from "./catalog.js";

export const specificationDataTypeValues = ["NUMBER", "TEXT", "BOOLEAN", "ENUM", "RANGE", "ARRAY", "JSON"] as const;
export type SpecificationDataType = (typeof specificationDataTypeValues)[number];

export const specificationDefinitions = pgTable(
  "specification_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    dataType: text("data_type").$type<SpecificationDataType>().notNull(),
    unit: text("unit"),
    validationJson: jsonb("validation_json").$type<Record<string, unknown>>().notNull(),
    searchWeight: integer("search_weight").notNull().default(0),
    isFilterable: boolean("is_filterable").notNull().default(false),
    isSearchable: boolean("is_searchable").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("specification_definitions_key_unique_idx").on(table.key)],
);

export const categorySpecifications = pgTable(
  "category_specifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryKey: text("category_key")
      .notNull()
      .references(() => categories.key, { onDelete: "cascade" }),
    specificationId: uuid("specification_id")
      .notNull()
      .references(() => specificationDefinitions.id, { onDelete: "cascade" }),
    isRequired: boolean("is_required").notNull().default(false),
    isFilterable: boolean("is_filterable").notNull().default(false),
    isVisibleOnCard: boolean("is_visible_on_card").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("category_specifications_category_spec_unique_idx").on(table.categoryKey, table.specificationId),
    index("category_specifications_category_idx").on(table.categoryKey),
  ],
);

export const productSpecValues = pgTable(
  "product_spec_values",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    specificationId: uuid("specification_id")
      .notNull()
      .references(() => specificationDefinitions.id, { onDelete: "cascade" }),
    rawValue: text("raw_value").notNull(),
    numericValue: numeric("numeric_value", { precision: 12, scale: 4 }),
    textValue: text("text_value"),
    booleanValue: boolean("boolean_value"),
    rangeMin: numeric("range_min", { precision: 12, scale: 4 }),
    rangeMax: numeric("range_max", { precision: 12, scale: 4 }),
    jsonValue: jsonb("json_value").$type<unknown>(),
    normalizedUnit: text("normalized_unit"),
    normalizedLabel: text("normalized_label"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("product_spec_values_product_spec_unique_idx").on(table.productId, table.specificationId),
    index("product_spec_values_spec_numeric_idx").on(table.specificationId, table.numericValue),
    index("product_spec_values_spec_text_idx").on(table.specificationId, table.textValue),
    index("product_spec_values_spec_range_idx").on(table.specificationId, table.rangeMin, table.rangeMax),
  ],
);

export type SpecificationDefinition = typeof specificationDefinitions.$inferSelect;
export type NewSpecificationDefinition = typeof specificationDefinitions.$inferInsert;
export type CategorySpecification = typeof categorySpecifications.$inferSelect;
export type NewCategorySpecification = typeof categorySpecifications.$inferInsert;
export type ProductSpecValue = typeof productSpecValues.$inferSelect;
export type NewProductSpecValue = typeof productSpecValues.$inferInsert;
