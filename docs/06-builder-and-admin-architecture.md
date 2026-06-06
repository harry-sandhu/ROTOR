# Builder and Admin Architecture

## Builder UX architecture

The builder is Rotor's most important screen.

It should make complex compatibility logic feel simple.

## Builder layout

### Left panel
Persistent summary area.

Contains:
- build name
- selected components by category
- quantity by category
- compatibility score
- validation status
- warnings
- missing components
- total cost
- save / duplicate / share actions

### Right panel
Current shopping and decision area.

Contains:
- active category selector
- search input
- category-specific filters
- list/grid of candidate products
- compatibility explanations for selected/candidate items
- quick spec comparison for current category

## Builder flow design

### Category progression for MVP
1. Frame
2. Motor
3. ESC
4. Battery
5. Propeller

### Interaction rule
The user may jump back to previous categories at any time, but each change must trigger reevaluation of the entire build.

## Builder state machine

### Core states
- `empty`
- `partial-build`
- `valid-build`
- `valid-build-with-warnings`
- `invalid-build`

### Key events
- `SELECT_COMPONENT`
- `REMOVE_COMPONENT`
- `CHANGE_QUANTITY`
- `APPLY_FILTERS`
- `SEARCH_CATEGORY`
- `LOAD_OPTIONS`
- `SAVE_BUILD`
- `DUPLICATE_BUILD`

## Frontend builder modules

```text
apps/web/src/features/builder/
├── components/
│   ├── BuilderLayout.tsx
│   ├── BuildSummaryPanel.tsx
│   ├── CategoryTabs.tsx
│   ├── CandidateList.tsx
│   ├── CompatibilityIssueList.tsx
│   └── SelectedComponentsList.tsx
├── hooks/
│   ├── useBuilderState.ts
│   ├── useBuildEvaluation.ts
│   └── useCompatibleOptions.ts
├── api/
│   ├── evaluateBuild.ts
│   ├── getOptions.ts
│   └── saveBuild.ts
└── store/
    └── builderStore.ts
```

## Builder data flow

1. User selects a category tab.
2. UI sends current selection context to `/compatibility/options`.
3. API returns compatible, warning, and optionally incompatible candidates.
4. User picks a product.
5. UI updates local state and requests `/compatibility/evaluate`.
6. Left panel updates build health and issues.
7. If the build is saved, mutations persist through `/builds/*` endpoints.

## Why keep evaluation server-side

- ensures consistent rule execution
- avoids duplicating compatibility logic in web code
- allows product pages and admin tools to reuse identical results
- keeps future mobile or third-party clients simple

## Product page UX architecture

Every product page should answer four questions immediately:

1. What is this part?
2. What are its important specs?
3. What does it work with?
4. What are similar alternatives?

### Product page sections
- Overview
- Specifications
- Compatibility information
- Compatible products
- Alternative products
- Community builds
- Price and stock

### Compatibility section behavior
For a frame page, show:
- compatible motors
- compatible ESCs by stack mount
- compatible prop sizes

For a motor page, show:
- compatible frames by mount pattern
- compatible ESCs by current rating
- compatible batteries by supported voltage
- recommended propellers

## Admin architecture

Admin must support catalog integrity first.

## Admin areas

### 1. Product management
Capabilities:
- create/edit/delete products
- manage product status
- manage images
- manage base entity fields
- assign spec values by category

### 2. Specification management
Capabilities:
- create/edit/delete specification definitions
- set data type, unit, validation metadata
- mark specs as searchable/filterable

### 3. Category specification mapping
Capabilities:
- assign which specs belong to which category
- mark required specs
- order display and filters

### 4. Compatibility rule management
Capabilities:
- create/edit/delete active rules
- select category pair
- select left/right specs
- choose operator
- set fail severity
- define explanation templates
- define threshold warnings

### 5. Import/export
Capabilities:
- CSV or JSON import of products and spec values
- validation preview before commit
- export products/specs/rules for backup or editing

## Admin form strategy

Do not hardcode product forms per category.

Instead:
- admin selects category
- frontend loads category specification metadata
- UI renders inputs based on spec definition `dataType`
- validation metadata drives form constraints

Example:
- `NUMBER` -> numeric input with min/max
- `ENUM` -> select input
- `RANGE` -> min/max pair input
- `ARRAY` -> tokenized multi-value input

## Admin module structure

```text
apps/api/src/modules/admin/
├── products/
│   ├── routes.ts
│   ├── service.ts
│   ├── repository.ts
│   └── schemas.ts
├── specifications/
│   ├── routes.ts
│   ├── service.ts
│   ├── repository.ts
│   └── schemas.ts
├── categories/
│   ├── routes.ts
│   ├── service.ts
│   └── repository.ts
├── rules/
│   ├── routes.ts
│   ├── service.ts
│   ├── repository.ts
│   └── schemas.ts
└── imports/
    ├── routes.ts
    ├── service.ts
    ├── parser.ts
    └── validator.ts
```

## UX rules for warnings and incompatibilities

### Compatible
- green badge
- optional positive explanation

### Warning
- amber badge
- visible explanation
- allow selection

### Incompatible
- red badge or hidden from default results
- if exposed, always include explanation
- never allow silent failure

## Saved build UX

A saved build detail page should show:
- selected components
- score and validation status
- compatibility change history after replacement operations
- duplicate button
- edit button
- share link if visibility allows it

## Share model

MVP visibility values:
- `PRIVATE`
- `UNLISTED`
- `PUBLIC`

Behavior:
- `PRIVATE`: only owner
- `UNLISTED`: anyone with link
- `PUBLIC`: visible in community builds and product pages

## Accessibility and clarity requirements

- never rely on color alone to communicate compatibility
- warnings and errors must have text labels
- product cards should show key specs without opening detail pages
- selected components should remain visible while browsing options

## Future-safe UI decisions

Even though MVP only has five categories, builder navigation should not assume a fixed count in component logic. Use category metadata from the API for order, labels, and enabled states.
