# Rotor Technical Architecture

## Architecture summary

Rotor should be implemented as a modular TypeScript monorepo with a shared domain layer.

### High-level layers

1. **Web app**
   Builder, product pages, saved builds, admin UI
2. **API app**
   Fastify routes, authentication, orchestration, OpenAPI
3. **Domain package**
   Compatibility engine, scoring, normalized types, rule evaluation
4. **Database package**
   Drizzle schema, migrations, seeds, shared query helpers
5. **Contracts package**
   Zod schemas and inferred TypeScript types for requests/responses

## Why this architecture fits Rotor

Rotor is not just CRUD.

The hardest part of the product is evaluating compatibility consistently across multiple surfaces:

- builder option filtering
- product pages
- saved build health checks
- admin validation before publishing products
- import validation

That is why the compatibility engine must live in a shared domain layer instead of inside routes or repositories.

## Request flow

```text
Web UI
  -> Fastify route
    -> Zod validation
      -> Service
        -> Repository + Domain evaluator
          -> Drizzle / PostgreSQL
        -> Mapper
      -> Typed response
```

## Backend modules

### Auth
Responsibilities:
- registration
- login
- refresh/logout
- role resolution (`USER`, `ADMIN`)
- route guards

### Categories
Responsibilities:
- list active categories
- list category-specific spec definitions
- expose builder ordering metadata

### Products
Responsibilities:
- list/filter/search products
- fetch product detail pages
- fetch product specifications and images
- fetch category-specific compatible suggestions

### Specifications
Responsibilities:
- list specification definitions
- list category-to-spec mappings
- validate product spec payloads against definitions
- expose admin metadata for form generation

### Compatibility
Responsibilities:
- evaluate a partial or complete build
- return compatibility statuses and explanations
- return compatible options for a target category
- produce build health score and warnings

### Builds
Responsibilities:
- create/update/delete builds
- save selected components
- duplicate builds
- calculate totals and health summaries
- support public/private/unlisted visibility

### Search
Responsibilities:
- keyword search
- structured filter search
- spec-based query parsing
- suggestion endpoints for builder and product exploration

### Validation
Responsibilities:
- validate imported product data
- validate product completeness before publish
- validate build requests and payloads

### Admin
Responsibilities:
- manage products
- manage images
- manage specification definitions
- manage category-spec assignments
- manage compatibility rules
- import/export catalog data

## Service and repository boundaries

### Route layer
Should only do:
- auth enforcement
- request/response schema binding
- invoke service methods
- map domain errors to HTTP responses

### Service layer
Should do:
- use-case orchestration
- permission checks
- combine repository reads with domain evaluation
- trigger build recalculation
- shape response DTOs

### Repository layer
Should do:
- SQL queries only
- pagination
- filtering
- joins for products/specifications/builds
- no compatibility decisions

### Domain layer
Should do:
- spec normalization
- rule evaluation
- compatibility scoring
- explanation generation
- build health derivation

## Recommended file ownership by concern

### `products`
- `routes.ts`: list, detail, compatible products, alternatives, product builds
- `service.ts`: query orchestration, filter composition, DTO shaping
- `repository.ts`: product/spec/image/build joins
- `mapper.ts`: DB -> API payload mapping

### `compatibility`
- `routes.ts`: evaluate build, fetch options, validate selections
- `service.ts`: loads selected products + rules and calls evaluator
- `evaluator.ts`: applies rule operators and builds result graph
- `option-service.ts`: evaluates candidate products against current selection

### `builds`
- `routes.ts`: create, update, duplicate, delete, share
- `service.ts`: persistence + recalculation
- `calculator.ts`: totals, missing categories, score, warnings
- `repository.ts`: build/build_components CRUD

## Validation architecture

Use shared Zod schemas in `packages/contracts`.

Validation happens at three levels:

1. **API boundary validation**
   Query params, bodies, path params, response payloads
2. **Domain validation**
   Rule definitions, operator compatibility, required build categories
3. **Data validation**
   Product specs must match specification definition type and range constraints

## Authentication design

### Auth model
- Email + password for MVP
- JWT access token
- Refresh token rotation
- Role-based authorization

### Roles
- `USER`: save and manage own builds
- `ADMIN`: all catalog/spec/rule/import operations

### Protected areas
- all `/builds` write endpoints
- all `/admin/*` endpoints
- import/export endpoints

## Builder architecture

The builder is the main UX and should be stateful but API-driven.

### Frontend builder state

```ts
interface BuilderState {
  buildId?: string;
  selectedByCategory: Partial<Record<CategoryKey, SelectedComponent>>;
  quantitiesByCategory: Partial<Record<CategoryKey, number>>;
  availableOptionsByCategory: Partial<Record<CategoryKey, ProductListItem[]>>;
  evaluation?: CompatibilityEvaluation;
  filtersByCategory: Partial<Record<CategoryKey, CatalogFilters>>;
  searchQueryByCategory: Partial<Record<CategoryKey, string>>;
}
```

### Builder interaction model
- UI sends current selection context to `/compatibility/options`
- API returns only compatible and warning-level candidates, plus excluded reasons if requested
- UI updates right-side option list
- UI updates left-side build health summary

### Why API-driven filtering matters
It guarantees that:
- compatibility logic is centralized
- product pages and builder use the same evaluator
- build editing produces identical outcomes to first-time selection

## Product page architecture

A product detail page should compose from multiple read models:

- base product data
- structured spec list
- compatibility summary by adjacent category
- alternative products in same category/spec band
- community builds containing the product

This should be assembled by a product service, not by the frontend making many unrelated calls.

## Search architecture

Search should combine:

1. **Keyword match** on name, brand, slug
2. **Category match** on known category labels
3. **Spec token parsing** for strings like `2207`, `1900kv`, `6s`, `30x30`, `5 inch`
4. **Structured filters** from selected catalog filters

For MVP, PostgreSQL full-text search plus structured joins on `product_spec_values` is sufficient.

## Admin architecture

Admin should be metadata-driven wherever possible.

### Admin form generation
- category selection loads required spec definitions
- spec definitions determine input type, unit, validation, and help text
- compatibility rule definitions determine available lhs/rhs spec pickers and operators

### Admin workflows
1. Create or edit spec definitions
2. Attach specs to categories
3. Create or edit products
4. Add spec values per product
5. Validate product completeness
6. Publish product

## Type system strategy

Keep types in shared packages, not in route files.

### Main type groups
- `CategoryKey`
- `ProductStatus`
- `SpecificationDataType`
- `CompatibilityStatus`
- `RuleOperator`
- `BuildVisibility`
- `ProductSummary`
- `ProductDetail`
- `BuildDetail`
- `CompatibilityEvaluation`
- `CompatibilityIssue`
- `CatalogFilters`

## Caching strategy for MVP

Do not add Redis initially.

Use:
- database indexes
- efficient SQL
- optional persisted build evaluation snapshots
- HTTP caching for public product pages where helpful

## Scalability notes

Rotor should scale first through good data modeling, not extra infrastructure.

Priorities:
- index spec values well
- keep rule evaluation deterministic and pure
- minimize repeated product/spec joins
- support batched option evaluation for builder flows
- keep category/spec/rule metadata queryable and cacheable in process
