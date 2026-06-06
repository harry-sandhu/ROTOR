# Rotor API Contracts

## API conventions

- Base path: `/api/v1`
- All request and response schemas should be defined in `packages/contracts`
- Fastify should register OpenAPI from the same schemas
- Timestamps are ISO 8601 strings
- Money is returned as integer cents unless a formatted display field is added

## Authentication

### `POST /api/v1/auth/register`
Create a user account.

Request:
```json
{
  "email": "pilot@example.com",
  "password": "strong-password",
  "displayName": "Rotor Pilot"
}
```

Response:
```json
{
  "user": {
    "id": "usr_123",
    "email": "pilot@example.com",
    "displayName": "Rotor Pilot",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### `POST /api/v1/auth/login`
Login.

### `POST /api/v1/auth/refresh`
Refresh tokens.

### `POST /api/v1/auth/logout`
Logout current session.

### `GET /api/v1/auth/me`
Return current authenticated user.

## Categories and specifications

### `GET /api/v1/categories`
List active categories and builder ordering metadata.

### `GET /api/v1/categories/:categoryKey/specifications`
List specs assigned to a category.

Response includes:
- spec key
- display name
- data type
- unit
- validation metadata
- required flag
- filterable flag

### `GET /api/v1/specifications`
List all specification definitions.

## Products

### `GET /api/v1/products`
Catalog listing endpoint.

Supported query params:
- `category`
- `brand`
- `status`
- `minPrice`
- `maxPrice`
- `search`
- `inStock`
- `page`
- `pageSize`
- `sort`
- dynamic `spec.*` filters such as:
  - `spec.kv.min=1800`
  - `spec.cellCount=6`
  - `spec.stackMount=30x30`
  - `spec.size.max=5`

Response:
```json
{
  "items": [
    {
      "id": "prd_1",
      "slug": "axisf5-5in-frame",
      "name": "Axis F5 Frame",
      "brand": "AxisRC",
      "category": "FRAME",
      "priceCents": 6499,
      "stockQuantity": 12,
      "status": "ACTIVE",
      "thumbnailUrl": "https://...",
      "summarySpecs": [
        { "key": "wheelbase", "label": "Wheelbase", "value": "225 mm" },
        { "key": "stackMount", "label": "Stack Mount", "value": "30x30" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 24,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/v1/products/:productId`
Product detail page payload.

Includes:
- product base fields
- images
- full specification list
- compatibility summary by target category
- alternatives
- community builds

### `GET /api/v1/products/slug/:slug`
Slug-based product detail lookup.

### `GET /api/v1/products/:productId/compatible`
Return compatible products for a target category.

Query params:
- `targetCategory`
- `page`
- `pageSize`
- `includeWarnings`
- `includeExcludedReasons`

### `GET /api/v1/products/:productId/builds`
Community builds using a product.

## Search

### `GET /api/v1/search/products`
Global product search.

Query params:
- `q`
- `category`
- `page`
- `pageSize`

### `GET /api/v1/search/suggestions`
Return suggestion strings, brands, categories, and spec tokens.

## Builds

### `GET /api/v1/builds`
List current user's builds.

### `POST /api/v1/builds`
Create a build.

Request:
```json
{
  "name": "6S Freestyle Build",
  "description": "Primary park freestyle setup",
  "visibility": "PRIVATE"
}
```

### `GET /api/v1/builds/:buildId`
Return build detail with selected components and latest evaluation.

### `PATCH /api/v1/builds/:buildId`
Update build metadata.

### `DELETE /api/v1/builds/:buildId`
Delete a build.

### `PUT /api/v1/builds/:buildId/components/:categoryKey`
Set or replace the component for a category.

Request:
```json
{
  "productId": "prd_motor_2207_01",
  "quantity": 4
}
```

Behavior:
- validates product category matches `categoryKey`
- upserts the component row
- triggers evaluation recalculation

### `DELETE /api/v1/builds/:buildId/components/:categoryKey`
Remove selected category component.

### `POST /api/v1/builds/:buildId/duplicate`
Duplicate a build.

### `GET /api/v1/builds/:buildId/compatibility`
Get current compatibility evaluation for a saved build.

### `GET /api/v1/shared/builds/:buildId`
Return public/unlisted build view.

## Compatibility

### `POST /api/v1/compatibility/evaluate`
Evaluate an ad hoc partial or full build without saving.

Request:
```json
{
  "selections": {
    "FRAME": { "productId": "prd_frame_1", "quantity": 1 },
    "MOTOR": { "productId": "prd_motor_2", "quantity": 4 },
    "ESC": { "productId": "prd_esc_3", "quantity": 1 },
    "BATTERY": { "productId": "prd_battery_4", "quantity": 1 },
    "PROPELLER": { "productId": "prd_prop_5", "quantity": 4 }
  }
}
```

Response:
```json
{
  "overallStatus": "WARNING",
  "validationStatus": "VALID_WITH_WARNINGS",
  "score": 96,
  "totalCostCents": 42394,
  "missingCategories": [],
  "issues": [
    {
      "status": "WARNING",
      "code": "BATTERY_AT_ESC_LIMIT",
      "message": "Battery is at the ESC's maximum supported voltage.",
      "categories": ["BATTERY", "ESC"],
      "productIds": ["prd_battery_4", "prd_esc_3"]
    }
  ],
  "checks": []
}
```

### `POST /api/v1/compatibility/options`
Return candidate products for a target category based on current build context.

Request:
```json
{
  "targetCategory": "ESC",
  "selections": {
    "FRAME": { "productId": "prd_frame_1", "quantity": 1 },
    "MOTOR": { "productId": "prd_motor_2", "quantity": 4 }
  },
  "filters": {
    "brand": ["SpeedCore"],
    "price": { "max": 9500 },
    "spec": {
      "stackMount": ["30x30"]
    }
  },
  "search": "45A"
}
```

Response shape:
```json
{
  "targetCategory": "ESC",
  "compatible": [],
  "warning": [],
  "incompatible": [
    {
      "product": { "id": "prd_esc_x" },
      "reasons": [
        "ESC stack mount does not match the frame's stack mount."
      ]
    }
  ]
}
```

## Validation

### `POST /api/v1/validation/products`
Validate an incoming product payload before admin create/update.

### `POST /api/v1/validation/builds`
Validate a transient build payload.

Useful for:
- pre-save build checks
- import preview
- admin publish workflow

## Admin endpoints

All admin endpoints require role `ADMIN`.

### Products
- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `GET /api/v1/admin/products/:productId`
- `PATCH /api/v1/admin/products/:productId`
- `DELETE /api/v1/admin/products/:productId`
- `POST /api/v1/admin/products/:productId/images`
- `DELETE /api/v1/admin/products/:productId/images/:imageId`
- `POST /api/v1/admin/products/:productId/publish`

### Specifications
- `GET /api/v1/admin/specifications`
- `POST /api/v1/admin/specifications`
- `PATCH /api/v1/admin/specifications/:specificationId`
- `DELETE /api/v1/admin/specifications/:specificationId`

### Category-spec assignments
- `GET /api/v1/admin/categories/:categoryKey/specifications`
- `PUT /api/v1/admin/categories/:categoryKey/specifications`

### Compatibility rules
- `GET /api/v1/admin/rules`
- `POST /api/v1/admin/rules`
- `PATCH /api/v1/admin/rules/:ruleId`
- `DELETE /api/v1/admin/rules/:ruleId`

### Import/export
- `POST /api/v1/admin/import/products`
- `GET /api/v1/admin/export/products`
- `GET /api/v1/admin/export/specifications`
- `GET /api/v1/admin/export/rules`

## Shared contracts to define

Recommended files in `packages/contracts/src`:

- `auth.ts`
- `categories.ts`
- `specifications.ts`
- `products.ts`
- `builds.ts`
- `compatibility.ts`
- `search.ts`
- `admin.ts`

## Key response models

### `ProductSummary`
- `id`
- `slug`
- `name`
- `brand`
- `category`
- `priceCents`
- `stockQuantity`
- `status`
- `thumbnailUrl`
- `summarySpecs`

### `ProductDetail`
- all product fields
- `images`
- `specifications`
- `compatibilitySummary`
- `alternativeProducts`
- `communityBuilds`

### `BuildDetail`
- build fields
- `components`
- `evaluation`

### `CompatibilityOptionResult`
- `product`
- `status`
- `reasons`
- `matchedChecks`

## Fastify route file map

```text
apps/api/src/modules/
├── auth/routes.ts
├── categories/routes.ts
├── specifications/routes.ts
├── products/routes.ts
├── search/routes.ts
├── builds/routes.ts
├── compatibility/routes.ts
├── validation/routes.ts
└── admin/**/routes.ts
```

## API design rules

1. Keep route handlers thin.
2. Use shared schemas for request and response typing.
3. Return explanation-rich compatibility payloads.
4. Prefer resource-oriented routes for CRUD and action-oriented routes for evaluation.
5. Keep admin and public APIs separated by path.
