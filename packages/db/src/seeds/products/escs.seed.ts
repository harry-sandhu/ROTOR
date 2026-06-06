import { createSeedProductBundle } from "./shared.js";

const escBrands = ["SignalX", "VoltCore", "AeroDrive", "RotorWorks", "SkyMantis"] as const;

const microEscProfiles = [20, 25, 25, 30, 30, 35, 35, 40] as const;
const stackEscProfiles = [35, 40, 45, 45, 50, 50, 55, 55, 60, 60, 45, 50, 55, 60, 65, 65] as const;
const longRangeEscProfiles = [65, 70, 70, 75, 80, 80] as const;

function createEscSlug(brand: string, currentRating: number, stackMount: string, voltageRange: string, index: number): string {
  return `${brand}-${currentRating}a-${stackMount}-${voltageRange}-${index + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export const escProductBundles = [
  ...microEscProfiles.map((currentRating, index) => {
    const brand = escBrands[index % escBrands.length]!;
    const supportsSixS = index >= 4;
    const supportedVoltage = supportsSixS ? { min: 4, max: 6 } : { min: 3, max: 4 };
    const voltageRangeLabel = supportsSixS ? "4-6s" : "3-4s";

    return createSeedProductBundle({
      slug: createEscSlug(brand, currentRating, "20x20", voltageRangeLabel, index),
      name: `${brand} ${currentRating}A 20x20 ${supportsSixS ? "4-6S" : "3-4S"} ESC`,
      brand,
      categoryKey: "ESC",
      description: `Compact ${currentRating}A 20x20 ESC designed for micro and cinewhoop builds.`,
      priceCents: 3499 + index * 180,
      stockQuantity: 14 + (index % 5) * 4,
      specs: {
        currentRating,
        supportedVoltage,
        stackMount: "20x20",
      },
    });
  }),
  ...stackEscProfiles.map((currentRating, index) => {
    const brand = escBrands[(index + 1) % escBrands.length]!;

    return createSeedProductBundle({
      slug: createEscSlug(brand, currentRating, "30x30", "4-6s", index),
      name: `${brand} ${currentRating}A 30x30 4-6S ESC`,
      brand,
      categoryKey: "ESC",
      description: `Mainline ${currentRating}A 30x30 ESC for 5-inch freestyle and racing builds.`,
      priceCents: 4699 + index * 140,
      stockQuantity: 20 + (index % 6) * 5,
      specs: {
        currentRating,
        supportedVoltage: { min: 4, max: 6 },
        stackMount: "30x30",
      },
    });
  }),
  ...longRangeEscProfiles.map((currentRating, index) => {
    const brand = escBrands[(index + 2) % escBrands.length]!;

    return createSeedProductBundle({
      slug: createEscSlug(brand, currentRating, "30x30", "4-6s-lr", index),
      name: `${brand} ${currentRating}A LR 30x30 4-6S ESC`,
      brand,
      categoryKey: "ESC",
      description: `High-current ${currentRating}A ESC for 7-inch and long-range builds using a 30x30 stack.`,
      priceCents: 6999 + index * 170,
      stockQuantity: 10 + (index % 4) * 3,
      specs: {
        currentRating,
        supportedVoltage: { min: 4, max: 6 },
        stackMount: "30x30",
      },
    });
  }),
];
