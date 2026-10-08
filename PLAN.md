# Project Improvement Plan

## Current State
Rotor is a Bun/TypeScript Turborepo monorepo (apps/api on Fastify + Drizzle + PostgreSQL + Zod, apps/web on Next.js) implementing a compatibility-first drone-building platform. 15 commits on `main`, in sync with origin. The working tree has a single untracked-content diff in `apps/web/next-env.d.ts` (Next.js auto-regenerates this file; it is not meaningful and should not be committed). Core MVP features (builder, saved builds, admin management, compatibility engine, seed catalog, CI + base tests) are implemented per the README's status list, and this was verified against the actual scripts in `package.json` and `apps/api/package.json`.

## What Is Already Good
- README is thorough: product principles, full stack breakdown, a 10-document `docs/` index, local run commands, demo credentials, and an honest "Next recommended work" list.
- `docs/` folder has 10 numbered documents covering architecture, schema, compatibility engine, API contracts, seed strategy, testing/roadmap, and MVP phases — unusually complete documentation for a 15-commit project.
- `.env` is correctly gitignored (`.gitignore` excludes `.env` and `.env.*`, keeps `.env.example`); no secrets are tracked.
- Root scripts delegate cleanly to Turborepo tasks (`turbo dev`, `turbo build`, `turbo typecheck`, `turbo test`), and per-workspace scripts exist even where a workspace has no tests/lint yet (explicit `echo` placeholders rather than silent failures).

## Issues Found
- `apps/api` and `apps/web` currently have placeholder `lint`/`test` scripts ("not configured yet") per `apps/api/package.json`, so `turbo lint`/`turbo test` at the API layer do not yet exercise real checks — this matches the README's own "Next recommended work" item about expanding tests, so it's a known gap, not a doc error.
- `apps/web/next-env.d.ts` is modified in the working tree; this is Next.js-generated and regenerates on every `next dev`/`next build`, so it will keep showing as a diff unless added to `.gitignore`.

## Documentation
README verified against code: local commands (`bun install`, `bun run dev:api`, `dev:web`, `seed`, `typecheck`, `test`, `build`) all exist in `package.json`; port 3001 for the API matches `.env.example`'s `PORT=3001`; demo credentials and category list match the stated MVP scope. No factual errors found, so the README was left as-is per instructions (already excellent, no rewrite needed).

## Code Quality
N/A — not reviewed line-by-line in this pass (out of scope: doc-only task). The placeholder lint/test scripts in `apps/api` are the most visible gap.

## Testing
Real Vitest specs exist under `packages/domain/src/compatibility/*.test.ts` and `packages/db/src/seeds/validate.seed.test.ts`. The root `tests/` directory (tests/db, tests/domain) exists but app-level (`apps/api`, `apps/web`) automated tests are not yet configured, consistent with the README's "expand automated API integration tests" roadmap item.

## Security
No secrets found in the working tree or tracked files. `.env` is gitignored; `.env.example` only contains placeholder/local-dev values (e.g. `JWT_SECRET=change-me-please-123`, local Postgres connection string), which is appropriate for an example file.

## Architecture
Matches README: Bun workspaces + Turborepo, Fastify API, Drizzle ORM over PostgreSQL, Zod-validated contracts shared via `packages/contracts`, domain/compatibility logic isolated in `packages/domain`. This separation is sound and already called out well in `docs/02-technical-architecture.md`.

## UX / UI
N/A — not assessed in this doc-only pass.

## Performance
N/A — no obvious opportunity surfaced during this review; the compatibility engine's performance characteristics are discussed in `docs/04-compatibility-engine.md` already.

## DevOps / Deployment
README states "CI + base tests" are implemented; no deployment docs were reviewed in depth in this pass. Formal DB migrations are explicitly flagged by the README itself as not-yet-done ("generate and apply formal DB migrations").

## GitHub / Open Source Presentation
Repo is private, so open-source presentation (badges, contributing guide, license) is not a priority unless visibility changes in the future.

## Screenshots / Visual Assets
None present. Given this is an internal/private tool with a Next.js web app, a few screenshots of the builder flow and admin screens in the README would help onboard new contributors faster, but this is optional.

## README
Classification: Excellent (per briefing, confirmed). No rewrite performed. No factual errors were found to fix — commands, ports, demo credentials, and doc index all check out against the actual code.

## Priority Roadmap

### P0 — Critical
- Generate and apply formal Drizzle migrations instead of relying on dynamic/dev schema sync (already flagged in README).

### P1 — Important
- Replace placeholder `lint`/`test` scripts in `apps/api` (and `apps/web` if similarly stubbed) with real tooling so `turbo lint`/`turbo test` cover the API layer.
- Expand automated API integration tests, as already noted in the README's roadmap.

### P2 — Nice to Have
- Add `apps/web/next-env.d.ts` regeneration awareness (e.g. a note in CONTRIBUTING or docs) so contributors know this file's diff is expected and harmless.
- Add a few screenshots of the builder/admin UI to the README or docs for faster onboarding.

## Recommended Next Steps
1. Tackle formal DB migrations first (P0) since schema changes without migrations are the riskiest gap for a multi-contributor project.
2. Fill in real `lint`/`test` scripts for `apps/api` so CI actually exercises the API layer.
3. Continue down the README's own "Next recommended work" list (web UX/state handling, admin workflow hardening, richer compatibility summaries) — it already reflects accurate priorities.
