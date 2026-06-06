import { createSeedProductBundle } from "./shared.js";

const propBrands = ["SkyPulse", "RotorWorks", "AeroBlade", "VoltWing", "TriFlux"] as const;

const propProfiles = [
  { size: 3, pitch: 2.8, bladeStyle: "Tri-Blade" },
  { size: 3, pitch: 3.0, bladeStyle: "Tri-Blade" },
  { size: 3, pitch: 3.2, bladeStyle: "Tri-Blade" },
  { size: 3, pitch: 3.5, bladeStyle: "Tri-Blade" },
  { size: 3, pitch: 3.8, bladeStyle: "Tri-Blade" },
  { size: 3, pitch: 4.0, bladeStyle: "Bi-Blade" },
  { size: 3.5, pitch: 2.8, bladeStyle: "Tri-Blade" },
  { size: 3.5, pitch: 3.0, bladeStyle: "Tri-Blade" },
  { size: 3.5, pitch: 3.2, bladeStyle: "Tri-Blade" },
  { size: 3.5, pitch: 3.5, bladeStyle: "Tri-Blade" },
  { size: 3.5, pitch: 3.8, bladeStyle: "Tri-Blade" },
  { size: 3.5, pitch: 4.1, bladeStyle: "Bi-Blade" },
  { size: 5, pitch: 3.2, bladeStyle: "Tri-Blade" },
  { size: 5, pitch: 3.5, bladeStyle: "Tri-Blade" },
  { size: 5, pitch: 3.8, bladeStyle: "Tri-Blade" },
  { size: 5, pitch: 4.0, bladeStyle: "Tri-Blade" },
  { size: 5, pitch: 4.1, bladeStyle: "Tri-Blade" },
  { size: 5, pitch: 4.2, bladeStyle: "Tri-Blade" },
  { size: 5, pitch: 4.3, bladeStyle: "Tri-Blade" },
  { size: 5, pitch: 4.5, bladeStyle: "Tri-Blade" },
  { size: 5, pitch: 4.6, bladeStyle: "Tri-Blade" },
  { size: 5, pitch: 4.8, bladeStyle: "Bi-Blade" },
  { size: 5, pitch: 3.0, bladeStyle: "Bi-Blade" },
  { size: 5, pitch: 3.6, bladeStyle: "Tri-Blade" },
  { size: 7, pitch: 3.5, bladeStyle: "Bi-Blade" },
  { size: 7, pitch: 3.8, bladeStyle: "Bi-Blade" },
  { size: 7, pitch: 4.0, bladeStyle: "Bi-Blade" },
  { size: 7, pitch: 4.2, bladeStyle: "Bi-Blade" },
  { size: 7, pitch: 4.5, bladeStyle: "Tri-Blade" },
  { size: 7, pitch: 4.8, bladeStyle: "Tri-Blade" },
] as const;

export const propellerProductBundles = propProfiles.map((profile, index) => {
  const brand = propBrands[index % propBrands.length]!;
  const encodedSize = profile.size.toString().replace(".", "-");
  const encodedPitch = profile.pitch.toString().replace(".", "-");
  const slug = `${brand}-${encodedSize}in-${encodedPitch}-${profile.bladeStyle}-${index + 1}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return createSeedProductBundle({
    slug,
    name: `${brand} ${profile.size}\" ${profile.pitch} ${profile.bladeStyle}`,
    brand,
    categoryKey: "PROPELLER",
    description: `${profile.bladeStyle} propeller in ${profile.size}-inch size with ${profile.pitch} pitch for tuned Rotor build matching.`,
    priceCents: 299 + Math.round(profile.size * 40 + profile.pitch * 20),
    stockQuantity: 60 + (index % 10) * 12,
    specs: {
      size: profile.size,
      pitch: profile.pitch,
    },
  });
});
