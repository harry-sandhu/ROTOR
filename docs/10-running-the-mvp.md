# Running the Rotor MVP

## Prerequisites

- Bun `1.3.14`
- PostgreSQL

## Environment

Copy `.env.example` to `.env` and update values if needed.

Key values:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_BASE_URL`

## Install

```bash
bun install
```

## Current useful scripts

### Root
```bash
bun run dev
bun run build
bun run typecheck
bun run test
bun run dev:api
bun run dev:web
bun run seed
```

### Direct package execution
```bash
bun --cwd apps/api run dev
bun --cwd apps/web run dev
bun --cwd packages/db run seed
```

## Database setup flow

At the moment the project contains:
- Drizzle schema
- seed framework
- realistic MVP seed catalog

Typical local flow:
1. create PostgreSQL database
2. set `DATABASE_URL`
3. run migrations when generated
4. run seeds

Seed command:
```bash
bun run seed
```

## Start the apps

### API
```bash
bun run dev:api
```

API defaults:
- app: `http://localhost:3001`
- health: `http://localhost:3001/health`
- API base: `http://localhost:3001/api/v1`
- Swagger UI: `http://localhost:3001/docs`

### Web
```bash
bun run dev:web
```

Web default:
- app: `http://localhost:3000`

## Seeded demo accounts

After running seeds, these accounts exist:

### Demo user
- email: `demo@rotor.app`
- password: `RotorDemo123!`

### Admin user
- email: `admin@rotor.app`
- password: `RotorDemo123!`

## Current implemented surfaces

### API
- auth
- categories
- specifications
- products
- search
- validation
- compatibility
- builds
- admin specification/category/rule/product/import/export APIs

### Web
- auth page
- builder page
- product catalog page
- product detail page
- saved builds list/detail pages
- shared build page
- admin dashboard shell

## Quality checks

```bash
bun run typecheck
bun run test
bun run build
```

CI runs:
- install
- typecheck
- tests
