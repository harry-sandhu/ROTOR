# Testing, Error Handling, and Roadmap

## Testing strategy

Rotor needs stronger domain testing than UI testing in the first phase because compatibility accuracy is the product.

## Test layers

### 1. Unit tests
Target:
- compatibility operators
- score calculation
- warning threshold logic
- spec normalization
- filter parsing
- search token parsing

Most important files to unit test first:
- `packages/domain/src/compatibility/operators.ts`
- `packages/domain/src/compatibility/evaluator.ts`
- `packages/domain/src/compatibility/scoring.ts`
- `apps/api/src/modules/validation/service.ts`

### 2. Repository integration tests
Use a real PostgreSQL test database.

Target:
- product query filters
- spec joins
- category-spec resolution
- build persistence
- compatibility rule loading

### 3. API integration tests
Use Fastify inject.

Target:
- auth flows
- product list and detail endpoints
- compatibility evaluate endpoint
- compatibility options endpoint
- build create/update endpoints
- admin validation and publish endpoints

### 4. End-to-end tests
Target main user journeys:
- build a 5-inch freestyle drone
- replace motor with incompatible option and see issue explanation
- save and duplicate build
- open product page and browse compatible products
- admin creates new product and publishes it

### 5. Seed validation tests
Target:
- minimum counts per category
- required specs present
- rules refer to existing categories and specs
- at least one valid build per core profile
- import/export roundtrip sanity

## Testing priorities by implementation phase

### Phase 1
- unit tests for compatibility engine
- repository tests for products/specs/rules

### Phase 2
- API tests for compatibility and builds

### Phase 3
- end-to-end tests for builder and admin workflows

## Error handling strategy

All API errors should use a consistent JSON envelope.

Example:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more specification values are invalid.",
    "details": [
      {
        "field": "specs.supportedVoltage",
        "message": "Range max must be greater than or equal to range min."
      }
    ],
    "requestId": "req_123"
  }
}
```

## Standard error codes

### Auth
- `AUTH_REQUIRED`
- `INVALID_CREDENTIALS`
- `TOKEN_EXPIRED`
- `FORBIDDEN`

### Product and build
- `NOT_FOUND`
- `CONFLICT`
- `INVALID_CATEGORY`
- `INVALID_PRODUCT_STATUS`
- `CATEGORY_MISMATCH`

### Specifications and rules
- `SPEC_DEFINITION_NOT_FOUND`
- `SPEC_VALUE_INVALID`
- `REQUIRED_SPEC_MISSING`
- `RULE_INVALID`
- `RULE_REFERENCES_UNKNOWN_SPEC`

### Compatibility
- `BUILD_INCOMPATIBLE`
- `BUILD_INCOMPLETE`
- `CANDIDATE_EVALUATION_FAILED`

### Import/export
- `IMPORT_VALIDATION_FAILED`
- `EXPORT_FAILED`

## Domain error mapping

Recommended domain errors:
- `NotFoundError`
- `ForbiddenError`
- `ValidationError`
- `ConflictError`
- `CompatibilityError`
- `ImportValidationError`

Fastify error handler should map these to status codes and envelopes.

## Logging rules

For MVP, structured logs are enough.

Log:
- request id
- user id if authenticated
- route
- status code
- duration
- error code

Also log compatibility evaluation summaries for debugging in non-production environments.

## Data quality safeguards

Because Rotor depends on spec accuracy, add these safeguards early:

1. block publish when required specs are missing
2. block publish when specs fail type/range validation
3. block publish when active rules cannot be evaluated because referenced specs are missing
4. validate imports in preview mode before commit
5. run seed validation in CI

## Performance safeguards

- add indexes before adding caching infrastructure
- batch product spec loading for option evaluation
- avoid N+1 queries in product detail and builds
- keep compatibility evaluation pure and in-memory after data load
- paginate compatible product results

## Security basics for MVP

- hash passwords with Argon2 or bcrypt
- protect admin routes with role checks
- validate all body/query/path inputs with shared schemas
- sanitize uploaded image metadata if file uploads are added later
- rate-limit auth endpoints

## Delivery roadmap

### Phase 0: foundation
- approve docs
- scaffold monorepo
- set up Fastify, Drizzle, PostgreSQL, contracts package
- create CI for lint, typecheck, tests

### Phase 1: data model
- implement schema and migrations
- implement spec normalization
- seed categories, specs, rules, and products
- add validation for publish/import

### Phase 2: compatibility core
- implement evaluator
- implement build health scoring
- implement `/compatibility/evaluate`
- implement `/compatibility/options`

### Phase 3: catalog and product pages
- implement product list/detail/search/filter APIs
- implement compatible products and alternatives on product pages

### Phase 4: saved builds
- implement build CRUD
- implement duplicate/share flows
- persist evaluation snapshots

### Phase 5: admin
- implement product/spec/category/rule management
- implement import/export
- implement admin validation workflows

### Phase 6: web experience
- implement builder UI
- implement product pages
- implement admin UI
- add end-to-end tests

## Immediate recommended next actions

1. Scaffold the folder structure from `docs/00-folder-structure.md`
2. Create Drizzle schema files and first migration
3. Implement category/spec/rule seed files
4. Build the compatibility domain package before any heavy UI work
5. Add tests for the exact MVP rules before expanding the catalog
