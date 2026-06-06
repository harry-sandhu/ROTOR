import type { NewCategorySpecification } from "../schema/specifications.js";
import { getSpecificationDefinitionId, specificationDefinitionIdByKey } from "./specification-definitions.seed.js";
import { stableUuid } from "./shared.js";

interface CategorySpecificationInput {
  categoryKey: string;
  specificationKey: keyof typeof specificationDefinitionIdByKey;
  isRequired: boolean;
  isFilterable: boolean;
  isVisibleOnCard: boolean;
  sortOrder: number;
}

const mappings: CategorySpecificationInput[] = [
  { categoryKey: "FRAME", specificationKey: "wheelbase", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 1 },
  { categoryKey: "FRAME", specificationKey: "maxPropSize", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 2 },
  { categoryKey: "FRAME", specificationKey: "stackMount", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 3 },
  { categoryKey: "FRAME", specificationKey: "motorMountPattern", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 4 },

  { categoryKey: "MOTOR", specificationKey: "kv", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 1 },
  { categoryKey: "MOTOR", specificationKey: "maxCurrent", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 2 },
  { categoryKey: "MOTOR", specificationKey: "supportedVoltage", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 3 },
  { categoryKey: "MOTOR", specificationKey: "mountPattern", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 4 },
  { categoryKey: "MOTOR", specificationKey: "recommendedPropSize", isRequired: true, isFilterable: true, isVisibleOnCard: false, sortOrder: 5 },

  { categoryKey: "ESC", specificationKey: "currentRating", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 1 },
  { categoryKey: "ESC", specificationKey: "supportedVoltage", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 2 },
  { categoryKey: "ESC", specificationKey: "stackMount", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 3 },

  { categoryKey: "BATTERY", specificationKey: "cellCount", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 1 },
  { categoryKey: "BATTERY", specificationKey: "capacity", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 2 },
  { categoryKey: "BATTERY", specificationKey: "dischargeRating", isRequired: true, isFilterable: true, isVisibleOnCard: false, sortOrder: 3 },

  { categoryKey: "PROPELLER", specificationKey: "size", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 1 },
  { categoryKey: "PROPELLER", specificationKey: "pitch", isRequired: true, isFilterable: true, isVisibleOnCard: true, sortOrder: 2 },
];

export const categorySpecificationSeeds: NewCategorySpecification[] = mappings.map((mapping) => ({
  id: stableUuid(`category-spec:${mapping.categoryKey}:${mapping.specificationKey}`),
  categoryKey: mapping.categoryKey,
  specificationId: getSpecificationDefinitionId(mapping.specificationKey),
  isRequired: mapping.isRequired,
  isFilterable: mapping.isFilterable,
  isVisibleOnCard: mapping.isVisibleOnCard,
  sortOrder: mapping.sortOrder,
}));
