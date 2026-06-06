import { createHash } from "node:crypto";

export function stableUuid(input: string): string {
  const hash = createHash("sha1").update(input).digest("hex");
  const part4 = ((Number.parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0");

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `5${hash.slice(13, 16)}`,
    `${part4}${hash.slice(18, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}

export function createPlaceholderImageUrl(label: string): string {
  return `https://placehold.co/800x800?text=${encodeURIComponent(label)}`;
}

export function toDbNumeric(value: number): string {
  return value.toString();
}

export function rangeLabel(min: number, max: number, unit: string | null): string {
  if (!unit) {
    return `${min}-${max}`;
  }

  return `${min}-${max}${unit}`;
}

export function scalarLabel(value: string | number | boolean | null, unit: string | null): string {
  if (value === null) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (unit) {
    return `${value} ${unit}`;
  }

  return String(value);
}

export interface SeedNumericRange {
  min: number;
  max: number;
}

export function isSeedNumericRange(value: unknown): value is SeedNumericRange {
  return typeof value === "object" && value !== null && "min" in value && "max" in value;
}
