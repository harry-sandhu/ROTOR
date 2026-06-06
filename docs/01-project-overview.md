# Rotor Project Overview

## What Rotor is

Rotor is a drone building platform that behaves like a compatibility assistant first and a catalog second.

The user should be able to pick a frame, then only see motors that fit that frame, then only see ESCs that work with the chosen motor, and so on. At every step the system should explain why a part is valid, risky, or invalid.

## Product goal

Help users build valid drone configurations without requiring expert knowledge of every electrical and mechanical relationship.

## MVP user types

### 1. Builder
A hobbyist or buyer who wants to assemble a working drone build.

Needs:
- Guided part selection
- Clear compatibility feedback
- Build cost and health summary
- Ability to save and share builds

### 2. Explorer
A user who lands on a product page and wants context.

Needs:
- Product specifications
- Compatible products by category
- Alternatives
- Community builds using the product

### 3. Admin
A catalog manager who maintains product and compatibility data.

Needs:
- Product CRUD
- Specification definition management
- Category specification requirements
- Compatibility rule management
- Import/export support

## MVP categories

Rotor MVP includes only:

- `FRAME`
- `MOTOR`
- `ESC`
- `BATTERY`
- `PROPELLER`

The schema and services must allow future categories without redesigning tables.

## Core domain language

- **Category**: high-level product type, such as `MOTOR`
- **Specification Definition**: metadata describing a spec, such as `kv` or `stackMount`
- **Product Specification Value**: the value a specific product has for a spec
- **Compatibility Rule**: a data-defined comparison between two specs
- **Build**: a saved selection of one product per category plus quantity
- **Build Health**: summary of compatibility score, status, warnings, and missing parts

## Success criteria for MVP

### User-facing
- A user can create a build from scratch using only compatible options.
- A user can see why an option is hidden or marked incompatible.
- A user can save, duplicate, edit, and share a build.
- Product pages surface compatibility context immediately.

### Data-facing
- Admins can define new specs without database schema changes.
- Compatibility outcomes are rule-driven, not controller hardcoded.
- Seed data provides enough realistic coverage to test the engine end-to-end.

### Engineering-facing
- Shared contracts drive API typing and frontend safety.
- Compatibility logic is testable outside HTTP and UI.
- New product categories can be added mainly through data and module extension.

## MVP features

### Builder
- Guided selection flow
- Compatibility-aware product filtering
- Build summary with total cost
- Build health score and validation state
- Warnings and issue explanations
- Save, edit, duplicate, replace components

### Product pages
- Overview
- Specifications
- Compatibility information
- Compatible products
- Alternative products
- Community builds
- Price and stock

### Search and filters
- Search by brand, category, name, and specs
- Filters for brand, price, category, voltage, mount pattern, prop size, stack size, KV, availability

### Admin
- Manage products
- Manage specs
- Manage category-spec mappings
- Manage compatibility rules
- Import/export product data

## Explicit non-goals for MVP

- Payments
- Shipping
- Marketplace features
- Marketing tooling
- Analytics suites
- CRM features
- AI recommendations
- Deployment infrastructure

## Primary user flows

### Build New Drone
1. User opens builder.
2. User selects a frame.
3. Compatible motors are fetched based on the current build context.
4. After motor selection, compatible ESCs are fetched.
5. After ESC selection, compatible batteries are fetched.
6. After battery selection, compatible propellers are fetched.
7. The system recalculates build health after every change.

### Product Exploration
1. User opens a product page.
2. Rotor shows structured specs.
3. Rotor shows compatible products for adjacent categories.
4. Rotor shows builds using the product.
5. Rotor shows alternatives in the same category and similar spec band.

### Existing Build Editing
1. User opens a saved build.
2. User replaces a component.
3. Rotor reevaluates compatibility across all selected parts.
4. Rotor highlights new warnings, incompatibilities, or score changes.

## Product principles that must guide implementation

1. **Explain every decision**
   Filtering without explanation creates distrust.
2. **Prefer derived compatibility over curated pairings**
   Pairwise manual compatibility lists will not scale.
3. **Make specs first-class**
   The catalog is only as good as the specification model.
4. **Use rule data, not route conditionals**
   The compatibility engine must be reusable across product pages, builds, search, and admin validation.
5. **Optimize for category growth**
   New categories should be onboarded through definitions, mappings, and rules.
