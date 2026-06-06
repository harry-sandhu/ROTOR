# Rotor

Rotor is a compatibility-first drone building platform.

The product goal is not simply listing drone parts for sale. Rotor exists to help users assemble valid drone builds with confidence by deriving compatibility from structured product specifications.

## MVP scope

Rotor MVP supports five product categories:

- `FRAME`
- `MOTOR`
- `ESC`
- `BATTERY`
- `PROPELLER`

Core MVP capabilities:

- Guided builder with compatibility-aware filtering
- Product pages with specs and compatibility context
- Saved, duplicated, and shareable builds
- Admin product/specification management
- Data-driven compatibility engine
- Realistic seed catalog for immediate testing

## Core product principles

1. **Compatibility first**
   Every major feature should improve selection accuracy, not just catalog browsing.
2. **Data over hardcoding**
   Compatibility must be derived from structured specifications and rule definitions.
3. **Explainability**
   Every incompatibility and warning must return a human-readable explanation.
4. **Extensibility**
   New categories and specs should be added without schema rewrites.
5. **Strong typing**
   Contracts, validation, repositories, and services should share typed definitions.

## Proposed stack

### Backend
- Node.js
- TypeScript
- Fastify
- Drizzle ORM
- PostgreSQL
- Zod for request/response validation and shared contracts

### Frontend
- Next.js + React + TypeScript
- Tailwind CSS
- TanStack Query
- Zustand or equivalent builder state store

### Shared packages
- Domain types and compatibility engine
- API contracts
- Database schema and seeds

## Proposed repository structure

See `docs/00-folder-structure.md`.

## Documentation index

- `docs/01-project-overview.md`
- `docs/02-technical-architecture.md`
- `docs/03-database-schema-and-drizzle.md`
- `docs/04-compatibility-engine.md`
- `docs/05-api-contracts.md`
- `docs/06-builder-and-admin-architecture.md`
- `docs/07-seed-data-strategy.md`
- `docs/08-testing-error-handling-and-roadmap.md`

## Recommended build order

1. Create database schema and migrations
2. Seed categories, spec definitions, and compatibility rules
3. Implement product/spec repositories
4. Implement compatibility engine and evaluation APIs
5. Implement builder APIs and saved builds
6. Implement admin product/spec/rule management
7. Implement web builder and product pages
8. Add import/export and seed validation automation

## Immediate next steps

- Approve architecture and schema design
- Scaffold monorepo structure
- Create Drizzle schema files and migrations
- Implement seed generation for realistic drone parts
- Build compatibility evaluation service before UI work
