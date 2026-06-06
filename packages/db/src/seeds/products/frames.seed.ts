import { createSeedProductBundle } from "./shared.js";

const frameProfiles = [
  { brand: "AeroForge", model: "Nano 145", wheelbase: 145, maxPropSize: 3, stackMount: "20x20", motorMountPattern: "9x9", priceCents: 4999, stockQuantity: 18 },
  { brand: "DriftCore", model: "Micro 150", wheelbase: 150, maxPropSize: 3, stackMount: "20x20", motorMountPattern: "9x9", priceCents: 5299, stockQuantity: 14 },
  { brand: "SkyMantis", model: "Sprint 155", wheelbase: 155, maxPropSize: 3, stackMount: "20x20", motorMountPattern: "9x9", priceCents: 5499, stockQuantity: 16 },
  { brand: "RotorWorks", model: "Pulse 160", wheelbase: 160, maxPropSize: 3, stackMount: "20x20", motorMountPattern: "9x9", priceCents: 5699, stockQuantity: 11 },

  { brand: "AeroForge", model: "Cine 155", wheelbase: 155, maxPropSize: 3.5, stackMount: "20x20", motorMountPattern: "12x12", priceCents: 5799, stockQuantity: 10 },
  { brand: "AtlasFPV", model: "Cine 160", wheelbase: 160, maxPropSize: 3.5, stackMount: "20x20", motorMountPattern: "12x12", priceCents: 6099, stockQuantity: 12 },
  { brand: "SkyMantis", model: "Vista 170", wheelbase: 170, maxPropSize: 3.5, stackMount: "20x20", motorMountPattern: "12x12", priceCents: 6299, stockQuantity: 8 },
  { brand: "DriftCore", model: "Vista 178", wheelbase: 178, maxPropSize: 3.5, stackMount: "20x20", motorMountPattern: "12x12", priceCents: 6499, stockQuantity: 9 },

  { brand: "AeroForge", model: "F5 V2", wheelbase: 210, maxPropSize: 5, stackMount: "30x30", motorMountPattern: "16x16", priceCents: 6799, stockQuantity: 18 },
  { brand: "VoltWing", model: "F5X 215", wheelbase: 215, maxPropSize: 5, stackMount: "30x30", motorMountPattern: "16x16", priceCents: 6999, stockQuantity: 20 },
  { brand: "SkyMantis", model: "F5 Pro 218", wheelbase: 218, maxPropSize: 5, stackMount: "30x30", motorMountPattern: "16x16", priceCents: 7199, stockQuantity: 17 },
  { brand: "RotorWorks", model: "Apex 220", wheelbase: 220, maxPropSize: 5, stackMount: "30x30", motorMountPattern: "16x16", priceCents: 7399, stockQuantity: 15 },
  { brand: "AtlasFPV", model: "Apex 222", wheelbase: 222, maxPropSize: 5, stackMount: "30x30", motorMountPattern: "16x16", priceCents: 7599, stockQuantity: 13 },
  { brand: "DriftCore", model: "Flow 223", wheelbase: 223, maxPropSize: 5, stackMount: "30x30", motorMountPattern: "16x16", priceCents: 7699, stockQuantity: 12 },
  { brand: "VoltWing", model: "Flow 225", wheelbase: 225, maxPropSize: 5, stackMount: "30x30", motorMountPattern: "16x16", priceCents: 7899, stockQuantity: 14 },
  { brand: "SkyMantis", model: "Strike 225", wheelbase: 225, maxPropSize: 5, stackMount: "30x30", motorMountPattern: "16x16", priceCents: 8099, stockQuantity: 10 },

  { brand: "AtlasFPV", model: "LR7 290", wheelbase: 290, maxPropSize: 7, stackMount: "30x30", motorMountPattern: "19x19", priceCents: 9499, stockQuantity: 8 },
  { brand: "RotorWorks", model: "Explorer 300", wheelbase: 300, maxPropSize: 7, stackMount: "30x30", motorMountPattern: "19x19", priceCents: 9799, stockQuantity: 7 },
  { brand: "AeroForge", model: "Ranger 305", wheelbase: 305, maxPropSize: 7, stackMount: "30x30", motorMountPattern: "19x19", priceCents: 9999, stockQuantity: 6 },
  { brand: "VoltWing", model: "Ranger 315", wheelbase: 315, maxPropSize: 7, stackMount: "30x30", motorMountPattern: "19x19", priceCents: 10499, stockQuantity: 5 },
] as const;

export const frameProductBundles = frameProfiles.map((profile) => {
  const slug = `${profile.brand}-${profile.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return createSeedProductBundle({
    slug,
    name: `${profile.brand} ${profile.model}`,
    brand: profile.brand,
    categoryKey: "FRAME",
    description: `${profile.maxPropSize}-inch ${profile.stackMount} frame with ${profile.motorMountPattern} motor mount support for compatibility-first Rotor builds.`,
    priceCents: profile.priceCents,
    stockQuantity: profile.stockQuantity,
    specs: {
      wheelbase: profile.wheelbase,
      maxPropSize: profile.maxPropSize,
      stackMount: profile.stackMount,
      motorMountPattern: profile.motorMountPattern,
    },
  });
});
