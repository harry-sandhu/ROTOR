import { createSeedProductBundle } from "./shared.js";

const batteryBrands = ["CellStorm", "VoltPack", "SkyCharge", "RotorWorks"] as const;

const batteryProfiles = [
  { cellCount: 4, capacity: 650, dischargeRating: 85, series: "Sprint" },
  { cellCount: 4, capacity: 850, dischargeRating: 95, series: "Sprint" },
  { cellCount: 4, capacity: 1050, dischargeRating: 100, series: "Sprint" },
  { cellCount: 4, capacity: 1300, dischargeRating: 100, series: "Freestyle" },
  { cellCount: 4, capacity: 1550, dischargeRating: 120, series: "Freestyle" },
  { cellCount: 4, capacity: 850, dischargeRating: 75, series: "Cine" },
  { cellCount: 6, capacity: 850, dischargeRating: 80, series: "Race" },
  { cellCount: 6, capacity: 950, dischargeRating: 90, series: "Race" },
  { cellCount: 6, capacity: 1050, dischargeRating: 95, series: "Race" },
  { cellCount: 6, capacity: 1100, dischargeRating: 80, series: "Cine" },
  { cellCount: 6, capacity: 1300, dischargeRating: 100, series: "Freestyle" },
  { cellCount: 6, capacity: 1400, dischargeRating: 110, series: "Freestyle" },
  { cellCount: 6, capacity: 1500, dischargeRating: 120, series: "Freestyle" },
  { cellCount: 6, capacity: 1550, dischargeRating: 100, series: "Freestyle" },
  { cellCount: 6, capacity: 1800, dischargeRating: 95, series: "Cruise" },
  { cellCount: 6, capacity: 2000, dischargeRating: 90, series: "Cruise" },
  { cellCount: 6, capacity: 2200, dischargeRating: 80, series: "LongRange" },
  { cellCount: 6, capacity: 1300, dischargeRating: 100, series: "Race" },
  { cellCount: 4, capacity: 1100, dischargeRating: 90, series: "Cine" },
  { cellCount: 6, capacity: 1600, dischargeRating: 110, series: "Freestyle" },
] as const;

export const batteryProductBundles = batteryProfiles.map((profile, index) => {
  const brand = batteryBrands[index % batteryBrands.length]!;
  const slug = `${brand}-${profile.cellCount}s-${profile.capacity}-${profile.dischargeRating}c-${profile.series}-${index + 1}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return createSeedProductBundle({
    slug,
    name: `${brand} ${profile.cellCount}S ${profile.capacity}mAh ${profile.dischargeRating}C`,
    brand,
    categoryKey: "BATTERY",
    description: `${profile.series} battery pack with ${profile.cellCount}S voltage, ${profile.capacity}mAh capacity, and ${profile.dischargeRating}C discharge rating.`,
    priceCents: 2499 + profile.cellCount * 300 + Math.floor(profile.capacity / 20),
    stockQuantity: 18 + (index % 7) * 4,
    specs: {
      cellCount: profile.cellCount,
      capacity: profile.capacity,
      dischargeRating: profile.dischargeRating,
    },
  });
});
