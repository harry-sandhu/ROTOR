# Rotor MVP Implementation Phases

This plan breaks the Rotor MVP into small reviewable phases.

Each phase should be completed, committed, and reviewed before moving to the next one.

## Phase 01 — Workspace bootstrap
**Goal:** Create the monorepo foundation.

**Deliverables:**
- root `package.json` with Bun workspaces
- `bun.lock`
- `turbo.json`
- base `tsconfig` files
- initial `apps/` and `packages/` folders

**Expected file changes:**
- `package.json`
- `bun.lock`
- `turbo.json`
- `tsconfig.base.json`
- `apps/`
- `packages/`

---

## Phase 02 — API app scaffold
**Goal:** Create the Fastify application skeleton.

**Deliverables:**
- `apps/api/package.json`
- Fastify app bootstrap
- server entrypoint
- plugin registration structure

**Expected file changes:**
- `apps/api/src/app.ts`
- `apps/api/src/server.ts`
- `apps/api/src/plugins/*`
- `apps/api/tsconfig.json`

---

## Phase 03 — Web app scaffold
**Goal:** Create the Next.js frontend shell.

**Deliverables:**
- `apps/web` scaffold
- app router setup
- base layout
- empty routes for builder, products, builds, admin

**Expected file changes:**
- `apps/web/package.json`
- `apps/web/src/app/*`
- `apps/web/tsconfig.json`

---

## Phase 04 — Shared contracts package scaffold
**Goal:** Create the contracts package for Zod schemas and inferred types.

**Deliverables:**
- contracts package setup
- index exports
- placeholder schema files

**Expected file changes:**
- `packages/contracts/package.json`
- `packages/contracts/src/index.ts`
- `packages/contracts/src/*.ts`

---

## Phase 05 — Shared domain package scaffold
**Goal:** Create the domain package for compatibility logic.

**Deliverables:**
- domain package setup
- type exports
- compatibility module directories

**Expected file changes:**
- `packages/domain/package.json`
- `packages/domain/src/index.ts`
- `packages/domain/src/compatibility/*`

---

## Phase 06 — Database package scaffold
**Goal:** Create the Drizzle package and DB client foundation.

**Deliverables:**
- db package setup
- Drizzle client
- migration config
- schema folder structure

**Expected file changes:**
- `packages/db/package.json`
- `packages/db/src/client.ts`
- `packages/db/src/schema/index.ts`
- `drizzle.config.ts`

---

## Phase 07 — Environment and config system
**Goal:** Add typed environment loading for API and DB.

**Deliverables:**
- env schema
- config loader
- API env plugin
- example env file

**Expected file changes:**
- `apps/api/src/plugins/env.ts`
- `packages/db/src/env.ts` or equivalent
- `.env.example`

---

## Phase 08 — Core shared domain types
**Goal:** Define canonical enums and shared domain types.

**Deliverables:**
- category keys
- statuses
- build visibility
- rule operator types
- compatibility status types

**Expected file changes:**
- `packages/domain/src/categories.ts`
- `packages/domain/src/products.ts`
- `packages/domain/src/builds.ts`
- `packages/domain/src/specifications.ts`

---

## Phase 09 — Core API contract schemas
**Goal:** Add shared request/response contracts for base entities.

**Deliverables:**
- auth contracts
- product summary/detail contracts
- build contracts
- compatibility contracts

**Expected file changes:**
- `packages/contracts/src/auth.ts`
- `packages/contracts/src/products.ts`
- `packages/contracts/src/builds.ts`
- `packages/contracts/src/compatibility.ts`

---

## Phase 10 — Database schema: auth and categories
**Goal:** Implement initial Drizzle schema for users and categories.

**Deliverables:**
- `users`
- `categories`
- schema exports
- initial migration

**Expected file changes:**
- `packages/db/src/schema/auth.ts`
- `packages/db/src/schema/catalog.ts`
- `packages/db/src/migrations/*`

---

## Phase 11 — Database schema: products and images
**Goal:** Implement product catalog tables.

**Deliverables:**
- `products`
- `product_images`
- indexes and relations

**Expected file changes:**
- `packages/db/src/schema/catalog.ts`
- `packages/db/src/schema/index.ts`
- migration files

---

## Phase 12 — Database schema: specification system
**Goal:** Implement the dynamic specification architecture.

**Deliverables:**
- `specification_definitions`
- `category_specifications`
- `product_spec_values`

**Expected file changes:**
- `packages/db/src/schema/specifications.ts`
- migration files

---

## Phase 13 — Database schema: compatibility and builds
**Goal:** Implement compatibility rules and build persistence tables.

**Deliverables:**
- `compatibility_rule_definitions`
- `builds`
- `build_components`
- `build_evaluations`

**Expected file changes:**
- `packages/db/src/schema/compatibility.ts`
- `packages/db/src/schema/builds.ts`
- migration files

---

## Phase 14 — Seed framework and seed runner
**Goal:** Create the seed execution flow.

**Deliverables:**
- seed runner
- deterministic helper utilities
- seed order orchestration

**Expected file changes:**
- `packages/db/src/seeds/index.ts`
- `packages/db/src/seeds/shared.ts`

---

## Phase 15 — Seed categories and specification definitions
**Goal:** Seed categories and all MVP specification definitions.

**Deliverables:**
- category seed data
- spec definition seed data
- category/spec mappings

**Expected file changes:**
- `packages/db/src/seeds/categories.seed.ts`
- `packages/db/src/seeds/specification-definitions.seed.ts`
- `packages/db/src/seeds/category-specifications.seed.ts`

---

## Phase 16 — Seed compatibility rules
**Goal:** Seed all MVP compatibility rules and warning thresholds.

**Deliverables:**
- rule seed data for all required relationships
- stable rule keys

**Expected file changes:**
- `packages/db/src/seeds/compatibility-rules.seed.ts`

---

## Phase 17 — Seed frames catalog
**Goal:** Seed realistic frame products.

**Deliverables:**
- at least 20 frames
- realistic specs and prices

**Expected file changes:**
- `packages/db/src/seeds/products/frames.seed.ts`

---

## Phase 18 — Seed motors catalog
**Goal:** Seed realistic motor products.

**Deliverables:**
- at least 50 motors
- correct KV/current/voltage profiles

**Expected file changes:**
- `packages/db/src/seeds/products/motors.seed.ts`

---

## Phase 19 — Seed ESC catalog
**Goal:** Seed realistic ESC products.

**Deliverables:**
- at least 30 ESCs
- correct stack and current profiles

**Expected file changes:**
- `packages/db/src/seeds/products/escs.seed.ts`

---

## Phase 20 — Seed batteries and propellers catalog
**Goal:** Seed remaining catalog products.

**Deliverables:**
- at least 20 batteries
- at least 30 propellers
- coherent compatibility coverage

**Expected file changes:**
- `packages/db/src/seeds/products/batteries.seed.ts`
- `packages/db/src/seeds/products/propellers.seed.ts`

---

## Phase 21 — Seed validation and sample builds
**Goal:** Prove that seed data works immediately.

**Deliverables:**
- sample users
- sample compatible builds
- seed validation script

**Expected file changes:**
- `packages/db/src/seeds/sample-users.seed.ts`
- `packages/db/src/seeds/sample-builds.seed.ts`
- `packages/db/src/seeds/validate.seed.ts`

---

## Phase 22 — API infrastructure plugins
**Goal:** Add foundational API plugins.

**Deliverables:**
- db plugin
- error handler plugin
- auth decorator shell
- OpenAPI registration

**Expected file changes:**
- `apps/api/src/plugins/db.ts`
- `apps/api/src/plugins/error-handler.ts`
- `apps/api/src/plugins/auth.ts`
- `apps/api/src/plugins/openapi.ts`

---

## Phase 23 — Authentication module
**Goal:** Implement user auth for MVP.

**Deliverables:**
- register/login/me endpoints
- password hashing
- JWT auth
- role support

**Expected file changes:**
- `apps/api/src/modules/auth/*`
- `packages/contracts/src/auth.ts`

---

## Phase 24 — Categories and specifications read APIs
**Goal:** Expose category and spec metadata to frontend/admin.

**Deliverables:**
- categories list endpoint
- category spec listing endpoint
- specification definitions endpoint

**Expected file changes:**
- `apps/api/src/modules/categories/*`
- `apps/api/src/modules/specifications/*`

---

## Phase 25 — Product repository foundation
**Goal:** Implement reusable product queries.

**Deliverables:**
- product repository
- spec joins
- image joins
- pagination utilities

**Expected file changes:**
- `apps/api/src/modules/products/repository.ts`
- `apps/api/src/lib/pagination.ts`

---

## Phase 26 — Product listing API
**Goal:** Implement catalog listing with filters.

**Deliverables:**
- `GET /products`
- category, brand, price, stock filters
- basic dynamic spec filtering

**Expected file changes:**
- `apps/api/src/modules/products/routes.ts`
- `apps/api/src/modules/products/service.ts`
- `apps/api/src/modules/products/schemas.ts`

---

## Phase 27 — Product detail API
**Goal:** Implement product detail read model.

**Deliverables:**
- `GET /products/:id`
- slug lookup endpoint
- full specifications
- images and summary sections

**Expected file changes:**
- `apps/api/src/modules/products/service.ts`
- `apps/api/src/modules/products/mapper.ts`
- `apps/api/src/modules/products/routes.ts`

---

## Phase 28 — Search module MVP
**Goal:** Implement search and suggestions.

**Deliverables:**
- keyword search
- simple spec token parsing
- suggestions endpoint

**Expected file changes:**
- `apps/api/src/modules/search/*`
- `packages/domain/src/search/*`

---

## Phase 29 — Specification normalization service
**Goal:** Normalize spec values consistently for writes and imports.

**Deliverables:**
- parse number/text/range specs
- canonical units and labels
- shared normalization helpers

**Expected file changes:**
- `packages/domain/src/specifications.ts`
- `apps/api/src/modules/validation/service.ts`
- possibly `packages/db/src/seeds/shared.ts`

---

## Phase 30 — Validation layer for products and rules
**Goal:** Add validation services for admin and import workflows.

**Deliverables:**
- product spec validation
- required spec checks
- rule reference validation

**Expected file changes:**
- `apps/api/src/modules/validation/*`
- `packages/contracts/src/specifications.ts`

---

## Phase 31 — Compatibility engine operators
**Goal:** Implement generic rule operators.

**Deliverables:**
- `EQ`
- `NEQ`
- `GTE`
- `LTE`
- `RANGE_CONTAINS`
- array/range helpers

**Expected file changes:**
- `packages/domain/src/compatibility/operators.ts`

---

## Phase 32 — Compatibility evaluation engine
**Goal:** Implement rule application and issue generation.

**Deliverables:**
- evaluator
- explanation formatter
- check aggregation
- missing-data behavior

**Expected file changes:**
- `packages/domain/src/compatibility/evaluator.ts`
- `packages/domain/src/compatibility/explanation.ts`
- `packages/domain/src/compatibility/missing-data.ts`

---

## Phase 33 — Build health scoring
**Goal:** Implement scoring and validation status logic.

**Deliverables:**
- compatibility score calculation
- missing category derivation
- warnings and issue grouping

**Expected file changes:**
- `packages/domain/src/compatibility/scoring.ts`
- `packages/domain/src/compatibility/thresholds.ts`

---

## Phase 34 — Compatibility API endpoints
**Goal:** Expose evaluation endpoints to the UI.

**Deliverables:**
- `POST /compatibility/evaluate`
- typed payloads and responses
- service orchestration loading products/specs/rules

**Expected file changes:**
- `apps/api/src/modules/compatibility/*`
- `packages/contracts/src/compatibility.ts`

---

## Phase 35 — Compatible options engine and API
**Goal:** Return filtered options per target category.

**Deliverables:**
- candidate evaluation service
- `POST /compatibility/options`
- compatible/warning/incompatible result groups

**Expected file changes:**
- `apps/api/src/modules/compatibility/option-service.ts`
- `apps/api/src/modules/compatibility/routes.ts`
- `packages/domain/src/compatibility/option-filter.ts`

---

## Phase 36 — Builds repository and CRUD APIs
**Goal:** Implement saved builds core.

**Deliverables:**
- build CRUD
- component upsert/remove
- duplicate build endpoint

**Expected file changes:**
- `apps/api/src/modules/builds/*`
- `packages/contracts/src/builds.ts`

---

## Phase 37 — Build evaluation persistence
**Goal:** Recalculate and persist build health snapshots.

**Deliverables:**
- build evaluation calculator
- snapshot persistence on mutation
- build compatibility read endpoint

**Expected file changes:**
- `apps/api/src/modules/builds/calculator.ts`
- `apps/api/src/modules/builds/service.ts`
- `apps/api/src/modules/builds/repository.ts`

---

## Phase 38 — Admin specifications and rules APIs
**Goal:** Implement admin management for metadata.

**Deliverables:**
- admin specification CRUD
- category-spec assignment management
- rule CRUD

**Expected file changes:**
- `apps/api/src/modules/admin/specifications/*`
- `apps/api/src/modules/admin/categories/*`
- `apps/api/src/modules/admin/rules/*`

---

## Phase 39 — Admin products and import/export APIs
**Goal:** Implement admin product lifecycle endpoints.

**Deliverables:**
- admin product CRUD
- publish validation
- import preview/commit
- export endpoints

**Expected file changes:**
- `apps/api/src/modules/admin/products/*`
- `apps/api/src/modules/admin/imports/*`
- `apps/api/src/modules/admin/exports/*`

---

## Phase 40 — Web builder MVP
**Goal:** Implement the main guided builder UI.

**Deliverables:**
- left summary panel
- right category option browser
- server-driven compatibility flow
- save build integration

**Expected file changes:**
- `apps/web/src/app/builder/*`
- `apps/web/src/features/builder/*`
- `apps/web/src/store/*`

---

## Phase 41 — Web catalog and product pages
**Goal:** Implement browsing and product detail experience.

**Deliverables:**
- product list page
- search/filter UI
- product detail page
- compatibility section and alternatives

**Expected file changes:**
- `apps/web/src/app/products/*`
- `apps/web/src/features/catalog/*`
- `apps/web/src/components/product/*`

---

## Phase 42 — Web saved builds experience
**Goal:** Implement build list, detail, edit, duplicate, and share views.

**Deliverables:**
- builds page
- build detail page
- shareable public build page

**Expected file changes:**
- `apps/web/src/app/builds/*`
- `apps/web/src/features/builds/*`

---

## Phase 43 — Web admin MVP
**Goal:** Implement admin UI for managing data.

**Deliverables:**
- product form
- specification form
- rule form
- import/export screens

**Expected file changes:**
- `apps/web/src/app/admin/*`
- `apps/web/src/features/admin/*`
- `apps/web/src/components/admin/*`

---

## Phase 44 — Test suite and quality gates
**Goal:** Add automated confidence around the MVP.

**Deliverables:**
- unit tests for compatibility logic
- API integration tests
- seed validation tests
- basic e2e builder flow tests

**Expected file changes:**
- `packages/domain/src/**/*.test.ts`
- `apps/api/src/**/*.test.ts`
- `tests/e2e/*`
- CI scripts

---

## Phase 45 — MVP polish and hardening
**Goal:** Final cleanup before feature-complete MVP review.

**Deliverables:**
- error message cleanup
- loading/empty/error states
- docs refresh
- final route registration checks
- final type and lint cleanup

**Expected file changes:**
- cross-cutting updates across API, web, contracts, and docs

---

## Recommended review workflow

For every phase:
1. Implement only the phase scope.
2. Show changed files.
3. Commit with a phase-specific message.
4. Push to GitHub.
5. Review before starting the next phase.

## Suggested commit naming

- `phase-01: scaffold workspace`
- `phase-02: scaffold api app`
- `phase-03: scaffold web app`
- `phase-04: scaffold contracts package`
- ...

## Best execution order

Do not skip ahead.

The most important early milestone is:
- Phase 01 through Phase 16 completed

That gives Rotor:
- working repo structure
- database schema
- dynamic specifications
- seeded categories/specs/rules

The most important product milestone is:
- Phase 17 through Phase 35 completed

That gives Rotor:
- realistic catalog
- compatibility engine
- compatible options API

The most important usable MVP milestone is:
- Phase 36 through Phase 45 completed

That gives Rotor:
- saved builds
- admin workflows
- UI
- tests
