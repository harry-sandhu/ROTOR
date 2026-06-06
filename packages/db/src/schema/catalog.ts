import { boolean, index, integer, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const productStatusValues = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type ProductStatus = (typeof productStatusValues)[number];

export const categories = pgTable("categories", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    brand: text("brand").notNull(),
    categoryKey: text("category_key")
      .notNull()
      .references(() => categories.key, { onDelete: "restrict" }),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    status: text("status").$type<ProductStatus>().notNull().default("DRAFT"),
    thumbnailUrl: text("thumbnail_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("products_slug_unique_idx").on(table.slug),
    index("products_category_status_idx").on(table.categoryKey, table.status),
    index("products_brand_category_idx").on(table.brand, table.categoryKey),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("product_images_product_idx").on(table.productId)],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
