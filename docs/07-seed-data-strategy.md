# Seed Data Strategy

## Goals

Seed data must make Rotor usable immediately after database setup.

The seed should:
- create all MVP categories
- create specification definitions and category mappings
- create compatibility rules
- create realistic products with coherent specs
- produce both compatible and incompatible combinations for testing

## Minimum seed counts

- 20 Frames
- 50 Motors
- 30 ESCs
- 20 Batteries
- 30 Propellers

Total minimum catalog: **150 products**

## Seed design approach

Do not hand-enter 150 random products.

Instead:
1. define realistic profile templates
2. generate multiple branded variants per profile
3. normalize all spec values during seed creation
4. seed compatibility rules before products are evaluated

## Seed order

1. categories
2. specification definitions
3. category specification mappings
4. compatibility rules
5. products
6. product spec values
7. sample users and sample builds

## Specification definitions to seed

### Shared / cross-category
- `stackMount`
- `supportedVoltage`
- `size`

### Frame specs
- `wheelbase`
- `maxPropSize`
- `motorMountPattern`

### Motor specs
- `kv`
- `maxCurrent`
- `mountPattern`
- `recommendedPropSize`

### ESC specs
- `currentRating`
- `supportedVoltage`
- `stackMount`

### Battery specs
- `cellCount`
- `capacity`
- `dischargeRating`

### Propeller specs
- `size`
- `pitch`

## Compatibility rules to seed

1. `FRAME.motorMountPattern EQ MOTOR.mountPattern`
2. `FRAME.maxPropSize GTE PROPELLER.size`
3. `FRAME.stackMount EQ ESC.stackMount`
4. `ESC.currentRating GTE MOTOR.maxCurrent`
5. `ESC.supportedVoltage RANGE_CONTAINS BATTERY.cellCount`
6. `MOTOR.supportedVoltage RANGE_CONTAINS BATTERY.cellCount`
7. `MOTOR.recommendedPropSize EQ PROPELLER.size` as warning

## Catalog profile matrix

## Frames: 20 total
Suggested profile mix:
- 4x 3-inch racing/freestyle frames
- 4x 3.5-inch cinewhoop frames
- 8x 5-inch freestyle/racing frames
- 4x 7-inch long-range frames

Typical frame spec ranges:

| Profile | Wheelbase | Max Prop | Stack Mount | Motor Mount Pattern |
|---|---:|---:|---|---|
| 3 inch | 140-160 mm | 3.0 | 20x20 | 9x9 |
| 3.5 inch | 150-180 mm | 3.5 | 20x20 | 12x12 |
| 5 inch | 210-225 mm | 5.0 | 30x30 | 16x16 |
| 7 inch | 280-320 mm | 7.0 | 30x30 | 19x19 |

## Motors: 50 total
Suggested mix:
- 10x micro motors for 3-inch builds
- 8x 3.5-inch cinewhoop motors
- 24x 5-inch motors across 1700-2550KV
- 8x 7-inch long-range motors

Typical motor profiles:

| Motor Size | Mount Pattern | KV Range | Max Current | Supported Voltage | Recommended Prop |
|---|---|---:|---:|---|---:|
| 1404 | 9x9 | 3600-4600 | 15-22A | 3-4S | 3.0 |
| 1507 | 12x12 | 2600-3800 | 18-28A | 4-6S | 3.5 |
| 2207 | 16x16 | 1750-2550 | 32-45A | 4-6S | 5.0 |
| 2806.5 | 19x19 | 900-1500 | 35-50A | 4-6S | 7.0 |

## ESCs: 30 total
Suggested mix:
- 8x 20x20 ESCs for micro and cine builds
- 16x 30x30 ESCs for 5-inch builds
- 6x high-current long-range ESCs

Typical ESC profiles:

| Stack Mount | Current Rating | Supported Voltage |
|---|---:|---|
| 20x20 | 20A-35A | 3-4S or 4-6S |
| 30x30 | 35A-60A | 4-6S |
| 30x30 | 65A-80A | 4-8S future-ready, MVP use 4-6S |

## Batteries: 20 total
Suggested mix:
- 6x 4S packs for 3-inch and 5-inch builds
- 10x 6S packs for freestyle and long-range
- 4x light 4S/6S cinewhoop packs

Typical battery profiles:

| Cell Count | Capacity | Discharge Rating |
|---|---:|---:|
| 4S | 650-1550 mAh | 75-120C |
| 6S | 850-2200 mAh | 70-120C |

## Propellers: 30 total
Suggested mix:
- 6x 3.0 inch props
- 6x 3.5 inch props
- 12x 5.0 inch props
- 6x 7.0 inch props

Typical prop profiles:

| Size | Pitch Range |
|---|---:|
| 3.0 | 2.5-4.0 |
| 3.5 | 2.8-4.2 |
| 5.0 | 3.0-4.8 |
| 7.0 | 3.5-5.0 |

## Example seeded products

### Frame example
```json
{
  "slug": "aeroforge-f5-v2",
  "name": "AeroForge F5 V2",
  "brand": "AeroForge",
  "category": "FRAME",
  "priceCents": 6999,
  "stockQuantity": 18,
  "status": "ACTIVE",
  "specs": {
    "wheelbase": 225,
    "maxPropSize": 5,
    "stackMount": "30x30",
    "motorMountPattern": "16x16"
  }
}
```

### Motor example
```json
{
  "slug": "voltcore-2207-1950kv",
  "name": "VoltCore 2207 1950KV",
  "brand": "VoltCore",
  "category": "MOTOR",
  "priceCents": 2499,
  "stockQuantity": 76,
  "status": "ACTIVE",
  "specs": {
    "kv": 1950,
    "maxCurrent": 38,
    "supportedVoltage": { "min": 4, "max": 6 },
    "mountPattern": "16x16",
    "recommendedPropSize": 5
  }
}
```

### ESC example
```json
{
  "slug": "signalx-45a-30x30",
  "name": "SignalX 45A 4-6S ESC",
  "brand": "SignalX",
  "category": "ESC",
  "priceCents": 5999,
  "stockQuantity": 34,
  "status": "ACTIVE",
  "specs": {
    "currentRating": 45,
    "supportedVoltage": { "min": 4, "max": 6 },
    "stackMount": "30x30"
  }
}
```

### Battery example
```json
{
  "slug": "cellstorm-6s-1300-100c",
  "name": "CellStorm 6S 1300mAh 100C",
  "brand": "CellStorm",
  "category": "BATTERY",
  "priceCents": 4299,
  "stockQuantity": 42,
  "status": "ACTIVE",
  "specs": {
    "cellCount": 6,
    "capacity": 1300,
    "dischargeRating": 100
  }
}
```

### Propeller example
```json
{
  "slug": "skypulse-5140-tri",
  "name": "SkyPulse 5140 Tri-Blade",
  "brand": "SkyPulse",
  "category": "PROPELLER",
  "priceCents": 399,
  "stockQuantity": 150,
  "status": "ACTIVE",
  "specs": {
    "size": 5,
    "pitch": 4.0
  }
}
```

## Example compatible build from seeds

- Frame: AeroForge F5 V2
- Motor: VoltCore 2207 1950KV
- ESC: SignalX 45A 4-6S ESC
- Battery: CellStorm 6S 1300mAh 100C
- Propeller: SkyPulse 5140 Tri-Blade

Expected outcome:
- compatible
- possible warning if battery equals ESC max range
- score around 96-100 depending on warning thresholds

## Seed script structure

```text
packages/db/src/seeds/
├── categories.seed.ts
├── specification-definitions.seed.ts
├── category-specifications.seed.ts
├── compatibility-rules.seed.ts
├── products/
│   ├── frames.seed.ts
│   ├── motors.seed.ts
│   ├── escs.seed.ts
│   ├── batteries.seed.ts
│   ├── propellers.seed.ts
│   └── shared.ts
├── sample-users.seed.ts
├── sample-builds.seed.ts
└── index.ts
```

## Seed generation rules

- use deterministic slugs
- use consistent brand pools per category
- generate realistic price bands by category
- generate stock variation for search/filter testing
- intentionally seed a subset of edge-case products near thresholds
- never seed products missing required specs unless they are explicitly test fixtures

## Seed validation tests

After seeding, automatically verify:
- category count is correct
- each active product has required specs
- each category meets minimum product count
- at least one fully compatible build exists for each main profile
- at least one incompatible example exists for each major rule
