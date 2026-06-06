# Rotor Database Schema and Drizzle Design

## Database philosophy

For Rotor, the database is the product.

Compatibility quality depends on:
- correct category modeling
- strongly defined specifications
- normalized product spec values
- data-driven compatibility rules

The schema must avoid adding a new database column every time admins add a new specification.

## Core design decisions

1. Use PostgreSQL.
2. Use a **dynamic specification model** instead of category-specific columns.
3. Keep product specs in a typed EAV-style table with normalized value columns.
4. Keep compatibility rules in data, not in controller conditionals.
5. Keep categories as rows, not enums in the database schema, so new categories are possible without schema rewrites.

## Main tables

### 1. `users`
Stores application users and admins.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| email | text unique | login identifier |
| password_hash | text | |
| display_name | text | |
| role | text | `USER` or `ADMIN` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 2. `categories`
Defines product categories.

| Column | Type | Notes |
|---|---|---|
| key | text pk | `FRAME`, `MOTOR`, `ESC`, `BATTERY`, `PROPELLER` |
| name | text | display label |
| description | text | |
| sort_order | integer | builder order |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 3. `products`
Base product entity.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| slug | text unique | |
| name | text | |
| brand | text | |
| category_key | text fk -> categories.key | |
| description | text | |
| price_cents | integer | store money as integer |
| stock_quantity | integer | |
| status | text | `DRAFT`, `ACTIVE`, `ARCHIVED` |
| thumbnail_url | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 4. `product_images`
Optional image gallery.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| product_id | uuid fk -> products.id | |
| image_url | text | |
| alt_text | text | |
| sort_order | integer | |
| created_at | timestamptz | |

### 5. `specification_definitions`
Metadata for each specification.

Examples:
- `wheelbase`
- `maxPropSize`
- `stackMount`
- `kv`
- `supportedVoltage`
- `currentRating`

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| key | text unique | stable machine key |
| name | text | display label |
| description | text | admin help text |
| data_type | text | `NUMBER`, `TEXT`, `BOOLEAN`, `ENUM`, `RANGE`, `ARRAY`, `JSON` |
| unit | text nullable | `mm`, `inch`, `A`, `KV`, `S`, etc. |
| validation_json | jsonb | min/max/options/pattern metadata |
| search_weight | integer | higher means more important in search |
| is_filterable | boolean | catalog filter support |
| is_searchable | boolean | text/spec token search support |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 6. `category_specifications`
Assigns which specs belong to which categories.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| category_key | text fk -> categories.key | |
| specification_id | uuid fk -> specification_definitions.id | |
| is_required | boolean | required before publishing |
| is_filterable | boolean | category-specific filtering |
| is_visible_on_card | boolean | summary cards |
| sort_order | integer | |
| created_at | timestamptz | |

Unique: `(category_key, specification_id)`

### 7. `product_spec_values`
Stores the actual spec values for products.

This is the heart of the dynamic specification system.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| product_id | uuid fk -> products.id | |
| specification_id | uuid fk -> specification_definitions.id | |
| raw_value | text | original admin/import input |
| numeric_value | numeric nullable | for number-based queries |
| text_value | text nullable | for text/enum values |
| boolean_value | boolean nullable | |
| range_min | numeric nullable | for `RANGE` |
| range_max | numeric nullable | for `RANGE` |
| json_value | jsonb nullable | arrays/structured payloads |
| normalized_unit | text nullable | canonical unit after normalization |
| normalized_label | text nullable | search-friendly canonical string |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Unique: `(product_id, specification_id)`

### 8. `compatibility_rule_definitions`
Data-driven compatibility rules.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| key | text unique | stable identifier |
| name | text | admin label |
| description | text | |
| from_category_key | text fk -> categories.key | |
| to_category_key | text fk -> categories.key | |
| left_specification_id | uuid fk -> specification_definitions.id | |
| operator | text | see operators below |
| right_specification_id | uuid fk -> specification_definitions.id | |
| severity_on_fail | text | `WARNING` or `INCOMPATIBLE` |
| success_message_template | text nullable | optional |
| failure_message_template | text | human explanation |
| warning_threshold_json | jsonb nullable | near-limit thresholds |
| is_active | boolean | |
| sort_order | integer | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 9. `builds`
Saved user builds.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk -> users.id | nullable for guest builds if later enabled |
| name | text | |
| description | text | |
| visibility | text | `PRIVATE`, `UNLISTED`, `PUBLIC` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 10. `build_components`
Selected components for a build.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| build_id | uuid fk -> builds.id | |
| product_id | uuid fk -> products.id | |
| category_key | text fk -> categories.key | denormalized for easier lookup |
| quantity | integer | e.g. 4 motors, 4 propellers |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Unique: `(build_id, category_key)`

### 11. `build_evaluations`
Optional persisted snapshot for fast build detail reads.

| Column | Type | Notes |
|---|---|---|
| build_id | uuid pk fk -> builds.id | |
| compatibility_score | integer | 0-100 |
| validation_status | text | `INCOMPLETE`, `VALID`, `VALID_WITH_WARNINGS`, `INVALID` |
| total_cost_cents | integer | |
| missing_categories | jsonb | array of category keys |
| warnings | jsonb | array of issue objects |
| issues | jsonb | array of issue objects |
| evaluated_at | timestamptz | |

## Recommended rule operators

Keep the operator set small and reusable.

- `EQ`
- `NEQ`
- `GTE`
- `LTE`
- `RANGE_CONTAINS`
- `RANGE_OVERLAPS`
- `ARRAY_CONTAINS`
- `ARRAY_OVERLAPS`

The engine should know how to execute operators generically. Actual business rules come from `compatibility_rule_definitions`.

## How dynamic specs work in practice

### Example: frame
- `wheelbase` -> `NUMBER`, `mm`
- `maxPropSize` -> `NUMBER`, `inch`
- `stackMount` -> `TEXT` or `ENUM`
- `motorMountPattern` -> `TEXT` or `ENUM`

### Example: motor
- `kv` -> `NUMBER`
- `maxCurrent` -> `NUMBER`, `A`
- `supportedVoltage` -> `RANGE`, `S`
- `mountPattern` -> `TEXT`
- `recommendedPropSize` -> `NUMBER`, `inch`

### Example: battery
- `cellCount` -> `NUMBER`, `S`
- `capacity` -> `NUMBER`, `mAh`
- `dischargeRating` -> `NUMBER`, `C`

## Why store typed value columns

A single JSON blob per product would be flexible but weak for filtering and indexing.

Typed columns allow:
- filtering `kv >= 1900`
- filtering `stackMount = '30x30'`
- checking range containment for `6S`
- indexing numeric and text lookups efficiently

## Suggested indexes

### Products
- unique index on `slug`
- index on `(category_key, status)`
- index on `(brand, category_key)`

### Product spec values
- unique index on `(product_id, specification_id)`
- index on `(specification_id, numeric_value)`
- index on `(specification_id, text_value)`
- index on `(specification_id, range_min, range_max)`
- GIN index on `json_value` if array/json specs are used heavily

### Compatibility rules
- index on `(from_category_key, to_category_key, is_active)`

### Build components
- unique index on `(build_id, category_key)`
- index on `(product_id)`

## Drizzle schema file plan

```text
packages/db/src/schema/
├── auth.ts
├── catalog.ts
├── specifications.ts
├── compatibility.ts
├── builds.ts
└── index.ts
```

### `catalog.ts`
Contains:
- `categories`
- `products`
- `productImages`

### `specifications.ts`
Contains:
- `specificationDefinitions`
- `categorySpecifications`
- `productSpecValues`

### `compatibility.ts`
Contains:
- `compatibilityRuleDefinitions`

### `builds.ts`
Contains:
- `builds`
- `buildComponents`
- `buildEvaluations`

## Example Drizzle modeling approach

```ts
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  categoryKey: text("category_key").notNull().references(() => categories.key),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  status: text("status").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

## Publish validation rules

A product should not become `ACTIVE` unless:
- all required category specs exist
- all spec values match definition type and allowed range
- required compatibility-participating specs are present
- slug is unique
- brand and name are not empty

## Future-proofing without schema changes

Adding a new category should require:
1. insert category row
2. add category-spec mappings
3. add products and spec values
4. add compatibility rules
5. optionally add UI metadata

That is the key reason the schema avoids per-category tables and per-spec product columns.
