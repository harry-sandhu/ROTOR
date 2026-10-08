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

## Current stack

### Backend
- Node.js-compatible TypeScript runtime via Bun
- Fastify
- Drizzle ORM
- PostgreSQL
- Zod for request/response validation and shared contracts

### Frontend
- Next.js + React + TypeScript

### Shared packages
- Domain types and compatibility engine
- API contracts
- Database schema and seeds

### Tooling
- Bun workspaces
- Turborepo
- Vitest

## Repository structure

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
- `docs/09-mvp-phases.md`
- `docs/10-running-the-mvp.md`

## Current implementation status

Implemented:
- monorepo scaffolding with Bun workspaces
- Fastify API app
- Next.js web app shell and MVP screens
- dynamic Drizzle schema
- realistic MVP seed catalog
- compatibility engine and option filtering APIs
- saved builds APIs
- admin management APIs
- search, validation, and import/export APIs
- CI + base tests

## Local commands

```bash
bun install
bun run dev:api
bun run dev:web
bun run seed
bun run typecheck
bun run test
bun run build
```

These root scripts now shell into the correct workspace directories.

## Local URLs

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- API Docs: `http://localhost:3001/docs`

## Demo accounts after seeding

Local development only — these are seeded into your own local database, not a production credential:

- User: `demo@rotor.app` / `RotorDemo123!`
- Admin: `admin@rotor.app` / `RotorDemo123!`

## Next recommended work

- generate and apply formal DB migrations
- expand automated API integration tests
- refine web UX and state handling
- harden admin workflows and publish rules
- add richer product compatibility summaries on detail pages
