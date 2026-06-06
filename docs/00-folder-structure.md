# Rotor Folder Structure

This is the recommended project layout for a maintainable compatibility-first MVP.

```text
ROTOR/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   ├── plugins/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── db.ts
│   │   │   │   ├── env.ts
│   │   │   │   ├── error-handler.ts
│   │   │   │   └── openapi.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   ├── repository.ts
│   │   │   │   │   └── schemas.ts
│   │   │   │   ├── categories/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   └── repository.ts
│   │   │   │   ├── products/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   ├── repository.ts
│   │   │   │   │   ├── mapper.ts
│   │   │   │   │   └── schemas.ts
│   │   │   │   ├── specifications/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   ├── repository.ts
│   │   │   │   │   └── schemas.ts
│   │   │   │   ├── compatibility/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   ├── evaluator.ts
│   │   │   │   │   ├── option-service.ts
│   │   │   │   │   └── schemas.ts
│   │   │   │   ├── builds/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   ├── repository.ts
│   │   │   │   │   ├── calculator.ts
│   │   │   │   │   └── schemas.ts
│   │   │   │   ├── search/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   └── repository.ts
│   │   │   │   ├── validation/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   └── service.ts
│   │   │   │   └── admin/
│   │   │   │       ├── products/
│   │   │   │       ├── specifications/
│   │   │   │       ├── categories/
│   │   │   │       ├── rules/
│   │   │   │       ├── imports/
│   │   │   │       └── exports/
│   │   │   ├── lib/
│   │   │   │   ├── pagination.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── ids.ts
│   │   │   │   └── errors.ts
│   │   │   └── types/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── builder/
│       │   │   ├── products/
│       │   │   ├── builds/
│       │   │   ├── admin/
│       │   │   └── auth/
│       │   ├── components/
│       │   │   ├── builder/
│       │   │   ├── product/
│       │   │   ├── filters/
│       │   │   ├── compatibility/
│       │   │   └── admin/
│       │   ├── features/
│       │   │   ├── builder/
│       │   │   ├── catalog/
│       │   │   ├── builds/
│       │   │   └── admin/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── store/
│       │   └── types/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── db/
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── schema/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── catalog.ts
│   │   │   │   ├── specifications.ts
│   │   │   │   ├── compatibility.ts
│   │   │   │   ├── builds.ts
│   │   │   │   └── index.ts
│   │   │   ├── seeds/
│   │   │   │   ├── categories.seed.ts
│   │   │   │   ├── specification-definitions.seed.ts
│   │   │   │   ├── compatibility-rules.seed.ts
│   │   │   │   ├── products.seed.ts
│   │   │   │   └── index.ts
│   │   │   └── migrations/
│   ├── domain/
│   │   ├── src/
│   │   │   ├── categories.ts
│   │   │   ├── specifications.ts
│   │   │   ├── products.ts
│   │   │   ├── builds.ts
│   │   │   ├── compatibility/
│   │   │   │   ├── operators.ts
│   │   │   │   ├── evaluator.ts
│   │   │   │   ├── explanation.ts
│   │   │   │   ├── scoring.ts
│   │   │   │   └── thresholds.ts
│   │   │   └── search/
│   ├── contracts/
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── specifications.ts
│   │   │   ├── builds.ts
│   │   │   ├── compatibility.ts
│   │   │   ├── search.ts
│   │   │   └── admin.ts
│   └── ui/
│       └── src/
├── docs/
├── .pi/
├── package.json
├── turbo.json
├── tsconfig.base.json
├── bun.lock
└── README.md
```

## Why this structure

- `apps/api` keeps Fastify concerns isolated from domain logic.
- `packages/db` owns Drizzle schema, migrations, and seeds.
- `packages/domain` contains compatibility logic that can be tested without HTTP.
- `packages/contracts` centralizes Zod schemas and shared TypeScript types.
- `apps/web` consumes contracts instead of redefining payloads.

## Module pattern

Each API module should follow the same pattern:

- `routes.ts`: Fastify route registration
- `schemas.ts`: request/response contracts
- `service.ts`: business logic orchestration
- `repository.ts`: database access
- `mapper.ts`: DB-to-API shaping when needed

## MVP rule

Even if the initial implementation starts with only `apps/api` and `packages/db`, keep the directory boundaries above. Rotor will grow quickly once the compatibility engine, admin tools, and UI are active.
