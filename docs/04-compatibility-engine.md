# Rotor Compatibility Engine

## Purpose

The compatibility engine is Rotor's core business logic.

It must be:
- data-driven
- explainable
- deterministic
- reusable across builder, product pages, builds, and admin validation

## Design principles

1. **Rules are data**
   Compatibility rules live in `compatibility_rule_definitions`.
2. **Operators are generic**
   The engine knows how to evaluate `EQ`, `GTE`, `RANGE_CONTAINS`, and similar operators.
3. **Specs are normalized before comparison**
   Raw strings like `4-6S` should be normalized into structured values.
4. **Every failed or warning rule returns explanation text**
   No silent filtering.
5. **Evaluation works for partial builds and complete builds**
   The builder needs results even when only one or two categories are selected.

## Input model

The engine accepts:
- selected products with normalized spec values
- category metadata
- active compatibility rules
- optional candidate products for a target category

## Output model

```ts
interface CompatibilityEvaluation {
  overallStatus: "COMPATIBLE" | "WARNING" | "INCOMPATIBLE";
  validationStatus: "INCOMPLETE" | "VALID" | "VALID_WITH_WARNINGS" | "INVALID";
  score: number;
  missingCategories: CategoryKey[];
  totalCostCents: number;
  issues: CompatibilityIssue[];
  checks: CompatibilityCheckResult[];
}

interface CompatibilityIssue {
  status: "WARNING" | "INCOMPATIBLE";
  code: string;
  message: string;
  categories: CategoryKey[];
  productIds: string[];
  ruleKey?: string;
}

interface CompatibilityCheckResult {
  ruleKey: string;
  fromCategory: CategoryKey;
  toCategory: CategoryKey;
  status: "COMPATIBLE" | "WARNING" | "INCOMPATIBLE";
  message: string;
  leftValue: unknown;
  rightValue: unknown;
}
```

## Rule evaluation flow

1. Load selected products.
2. Load normalized spec values for selected products.
3. Load active compatibility rules relevant to selected categories.
4. For each rule:
   - resolve left spec value
   - resolve right spec value
   - if either spec is missing, return a missing-data issue or skip based on rule config
   - apply operator
   - generate status and explanation
5. Aggregate all results into warnings, incompatibilities, and score.

## Recommended MVP rules

### Hard incompatibility rules

1. **Frame motor mount vs motor mount**
   - `FRAME.motorMountPattern EQ MOTOR.mountPattern`
   - Fail status: `INCOMPATIBLE`
   - Message: `Motor mount pattern does not match frame mount pattern.`

2. **Frame max prop size vs propeller size**
   - `FRAME.maxPropSize GTE PROPELLER.size`
   - Fail status: `INCOMPATIBLE`
   - Message: `Propeller size exceeds the frame's maximum supported prop size.`

3. **ESC current vs motor max current**
   - `ESC.currentRating GTE MOTOR.maxCurrent`
   - Fail status: `INCOMPATIBLE`
   - Message: `ESC current rating is lower than the motor's maximum current draw.`

4. **ESC supported voltage vs battery cell count**
   - `ESC.supportedVoltage RANGE_CONTAINS BATTERY.cellCount`
   - Fail status: `INCOMPATIBLE`
   - Message: `Battery voltage exceeds ESC supported voltage range.`

5. **Motor supported voltage vs battery cell count**
   - `MOTOR.supportedVoltage RANGE_CONTAINS BATTERY.cellCount`
   - Fail status: `INCOMPATIBLE`
   - Message: `Battery voltage is outside the motor's supported range.`

6. **Frame stack mount vs ESC stack mount**
   - `FRAME.stackMount EQ ESC.stackMount`
   - Fail status: `INCOMPATIBLE`
   - Message: `ESC stack mount does not match the frame's stack mount.`

### Warning rules

1. **Motor recommended prop size vs actual prop size**
   - `MOTOR.recommendedPropSize EQ PROPELLER.size`
   - Fail status: `WARNING`
   - Message: `Propeller size differs from the motor's recommended prop size.`

2. **Battery at ESC maximum limit**
   - `ESC.supportedVoltage RANGE_CONTAINS BATTERY.cellCount`
   - Warning condition from threshold metadata: battery equals range max
   - Message: `Battery is at the ESC's maximum supported voltage.`

3. **ESC current headroom is low**
   - Based on threshold metadata for `ESC.currentRating` vs `MOTOR.maxCurrent`
   - Message: `ESC current rating is compatible but has low safety headroom.`

## Normalization strategy

Specs should be normalized during write and revalidated during import.

### Examples
- `5 inch` -> `numeric_value = 5`, `unit = inch`
- `30x30` -> `text_value = 30x30`
- `4-6S` -> `range_min = 4`, `range_max = 6`, `unit = S`
- `2207` -> `text_value = 2207` or structured json if size decomposition is needed later

## Partial build behavior

The engine must support incomplete selections.

Example:
- selected: frame + motor
- missing: ESC, battery, propeller

Expected behavior:
- evaluate available frame/motor rules
- return missing categories
- return `validationStatus = INCOMPLETE`
- still return compatible option suggestions for remaining categories

## Option filtering behavior

The builder should not only evaluate selected parts. It should also evaluate candidate products.

### `/compatibility/options` behavior
When the user asks for compatible ESCs:
1. take current selections
2. load all active ESC products matching user filters/search
3. evaluate each ESC candidate against selected frame and motor
4. return grouped results:
   - `compatible`
   - `warning`
   - `incompatible` with exclusion reasons if requested

This allows the UI to:
- show only compatible items by default
- optionally explain hidden items
- surface warnings without blocking the flow

## Build health calculation

## Validation status
- `INCOMPLETE`: one or more required categories missing
- `VALID`: complete build, no warnings, no incompatibilities
- `VALID_WITH_WARNINGS`: complete build, warnings present, no incompatibilities
- `INVALID`: one or more incompatibilities

## Compatibility score formula

Recommended MVP formula:

```text
score = (completenessRatio * 40)
      + (hardRulePassRatio * 60)
      - warningPenalty
```

Where:
- `completenessRatio = selectedRequiredCategories / totalRequiredCategories`
- `hardRulePassRatio = passedHardRules / totalEvaluatedHardRules`
- `warningPenalty = min(totalWarnings * 4, 20)`

### Example
- all categories selected
- all hard rules pass
- 1 warning

Score = `40 + 60 - 4 = 96`

## Explanation generation

Each rule record should carry a failure message template.

Optional template placeholders:
- `{fromCategory}`
- `{toCategory}`
- `{leftSpec}`
- `{rightSpec}`
- `{leftValue}`
- `{rightValue}`

Example rendered message:
- `Battery voltage 6S exceeds ESC support range 3S-4S.`

## Missing data policy

Missing specifications should not silently pass.

If a product lacks a required spec used by an active compatibility rule:
- admin validation should fail publish
- runtime evaluation should emit a warning or data-quality issue
- option filtering should exclude the product if the missing spec prevents safe evaluation

## Extensibility model

To add a new compatibility relationship later:
1. define or reuse spec definitions
2. assign specs to the relevant category
3. insert rule definitions with operators and messages
4. seed or import products with valid spec values

No schema change should be needed.

## Performance notes

- preload spec values for selected products in a single query
- preload relevant rules by category pairs
- evaluate in memory in the domain layer
- use batched candidate evaluation for option lists
- cache category metadata and active rule definitions in process for short TTLs if needed

## Suggested domain files

```text
packages/domain/src/compatibility/
├── evaluator.ts
├── operators.ts
├── explanation.ts
├── scoring.ts
├── missing-data.ts
└── option-filter.ts
```

## Minimum unit tests for the engine

- `EQ` pass/fail
- `GTE` pass/fail
- `RANGE_CONTAINS` pass/fail
- warning threshold generation
- missing spec behavior
- partial build evaluation
- full build score calculation
- candidate option filtering for each category pair
