import { createSeedProductBundle } from "./shared.js";

const motorBrands = ["VoltCore", "PulseDrive", "AeroTorque", "RotorWorks", "SkyMantis"] as const;

const microKvs = [3600, 3800, 4000, 4200, 4500, 4600, 3900, 4100, 4300, 4400] as const;
const cineKvs = [2800, 3000, 3200, 3400, 3600, 3800, 2900, 3100] as const;
const freestyleKvs = [1750, 1850, 1900, 1950, 2000, 2050, 2150, 2250, 2300, 2350, 2450, 2550] as const;
const freestyleAltKvs = [1780, 1880, 1920, 1980, 2020, 2080, 2180, 2280, 2320, 2380, 2480, 2520] as const;
const longRangeKvs = [900, 1050, 1100, 1250, 1350, 1450, 1000, 1200] as const;

function createMotorSlug(brand: string, size: string, kv: number, index: number): string {
  return `${brand}-${size}-${kv}kv-${index + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export const motorProductBundles = [
  ...microKvs.map((kv, index) => {
    const brand = motorBrands[index % motorBrands.length]!;
    const maxCurrent = 15 + (index % 7);

    return createSeedProductBundle({
      slug: createMotorSlug(brand, "1404", kv, index),
      name: `${brand} 1404 ${kv}KV`,
      brand,
      categoryKey: "MOTOR",
      description: `High-efficiency 1404 motor for 3-inch builds with ${kv}KV tuning and 9x9 mounting.`,
      priceCents: 1599 + index * 40,
      stockQuantity: 24 + (index % 9) * 3,
      specs: {
        kv,
        maxCurrent,
        supportedVoltage: { min: 3, max: 4 },
        mountPattern: "9x9",
        recommendedPropSize: 3,
      },
    });
  }),
  ...cineKvs.map((kv, index) => {
    const brand = motorBrands[(index + 1) % motorBrands.length]!;
    const maxCurrent = 20 + (index % 5) * 2;

    return createSeedProductBundle({
      slug: createMotorSlug(brand, "1507", kv, index),
      name: `${brand} 1507 ${kv}KV`,
      brand,
      categoryKey: "MOTOR",
      description: `Balanced 1507 cinewhoop motor with ${kv}KV output, 12x12 mount pattern, and support for 3.5-inch props.`,
      priceCents: 1799 + index * 45,
      stockQuantity: 18 + (index % 6) * 4,
      specs: {
        kv,
        maxCurrent,
        supportedVoltage: { min: 4, max: 6 },
        mountPattern: "12x12",
        recommendedPropSize: 3.5,
      },
    });
  }),
  ...freestyleKvs.map((kv, index) => {
    const brand = motorBrands[(index + 2) % motorBrands.length]!;
    const maxCurrent = 32 + (index % 6) * 2;

    return createSeedProductBundle({
      slug: createMotorSlug(brand, "2207", kv, index),
      name: `${brand} 2207 ${kv}KV`,
      brand,
      categoryKey: "MOTOR",
      description: `Freestyle-focused 2207 motor tuned for 5-inch quad builds, 16x16 mount support, and ${kv}KV response.`,
      priceCents: 2299 + index * 35,
      stockQuantity: 30 + (index % 8) * 5,
      specs: {
        kv,
        maxCurrent,
        supportedVoltage: { min: 4, max: 6 },
        mountPattern: "16x16",
        recommendedPropSize: 5,
      },
    });
  }),
  ...freestyleAltKvs.map((kv, index) => {
    const brand = motorBrands[(index + 3) % motorBrands.length]!;
    const maxCurrent = 34 + (index % 6) * 2;

    return createSeedProductBundle({
      slug: createMotorSlug(brand, "2306", kv, index),
      name: `${brand} 2306 ${kv}KV`,
      brand,
      categoryKey: "MOTOR",
      description: `Aggressive 2306 motor for 5-inch racing and freestyle with 16x16 mounting and ${kv}KV tuning.`,
      priceCents: 2399 + index * 35,
      stockQuantity: 28 + (index % 7) * 4,
      specs: {
        kv,
        maxCurrent,
        supportedVoltage: { min: 4, max: 6 },
        mountPattern: "16x16",
        recommendedPropSize: 5,
      },
    });
  }),
  ...longRangeKvs.map((kv, index) => {
    const brand = motorBrands[(index + 4) % motorBrands.length]!;
    const maxCurrent = 38 + (index % 5) * 3;

    return createSeedProductBundle({
      slug: createMotorSlug(brand, "2806-5", kv, index),
      name: `${brand} 2806.5 ${kv}KV`,
      brand,
      categoryKey: "MOTOR",
      description: `Long-range 2806.5 motor for 7-inch builds with 19x19 mounting and ${kv}KV cruise efficiency.`,
      priceCents: 2899 + index * 55,
      stockQuantity: 16 + (index % 5) * 3,
      specs: {
        kv,
        maxCurrent,
        supportedVoltage: { min: 4, max: 6 },
        mountPattern: "19x19",
        recommendedPropSize: 7,
      },
    });
  }),
];
