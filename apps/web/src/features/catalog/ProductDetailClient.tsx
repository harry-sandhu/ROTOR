"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { apiGet, apiPost, ApiError } from "../../lib/api";

interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  stockQuantity: number;
  thumbnailUrl: string | null;
  summarySpecs: Array<{ key: string; label: string; value: string }>;
}

interface ProductDetail extends ProductSummary {
  description: string | null;
  specifications: Array<{ specificationKey: string; label: string; value: string | number | boolean | { min: number; max: number } | unknown[] | Record<string, unknown> | null; normalizedLabel: string | null }>;
  images: Array<{ id: string; imageUrl: string; altText: string | null }>;
  alternativeProducts: ProductSummary[];
}

interface CompatibilityOptionsResponse {
  targetCategory: string;
  compatible: Array<{ product: ProductSummary; reasons: string[] }>;
  warning: Array<{ product: ProductSummary; reasons: string[] }>;
}

const targetCategoriesByProductCategory: Record<string, string[]> = {
  FRAME: ["MOTOR", "ESC", "PROPELLER"],
  MOTOR: ["FRAME", "ESC", "BATTERY", "PROPELLER"],
  ESC: ["FRAME", "MOTOR", "BATTERY"],
  BATTERY: ["MOTOR", "ESC"],
  PROPELLER: ["FRAME", "MOTOR"],
};

function formatValue(value: ProductDetail["specifications"][number]["value"]) {
  if (value === null) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [compatibility, setCompatibility] = useState<Record<string, CompatibilityOptionsResponse>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<ProductDetail>(`/products/slug/${slug}`)
      .then((response) => {
        setProduct(response);
        setMessage(null);
      })
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Failed to load product."));
  }, [slug]);

  useEffect(() => {
    if (!product) return;

    const targetCategories = targetCategoriesByProductCategory[product.category] ?? [];
    void Promise.all(
      targetCategories.map(async (targetCategory) => {
        const response = await apiPost<CompatibilityOptionsResponse>("/compatibility/options", {
          targetCategory,
          selections: {
            [product.category]: {
              productId: product.id,
              quantity: product.category === "MOTOR" || product.category === "PROPELLER" ? 4 : 1,
            },
          },
        });

        return [targetCategory, response] as const;
      }),
    )
      .then((entries) => setCompatibility(Object.fromEntries(entries)))
      .catch(() => undefined);
  }, [product]);

  const compatibilityEntries = useMemo(() => Object.entries(compatibility), [compatibility]);

  if (message) {
    return <section><p style={{ margin: 0 }}>{message}</p></section>;
  }

  if (!product) {
    return <section><p style={{ margin: 0 }}>Loading product...</p></section>;
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section>
        <h1 style={{ marginTop: 0 }}>{product.brand} {product.name}</h1>
        <p style={{ color: "#a1a1aa" }}>{product.category} · ${(product.priceCents / 100).toFixed(2)} · Stock {product.stockQuantity}</p>
        <p>{product.description ?? "No description available."}</p>
      </section>
      <section>
        <h2 style={{ marginTop: 0 }}>Specifications</h2>
        <div style={{ display: "grid", gap: "0.4rem" }}>
          {product.specifications.map((specification) => (
            <div key={specification.specificationKey}>
              <strong>{specification.label}:</strong> {specification.normalizedLabel ?? formatValue(specification.value)}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 style={{ marginTop: 0 }}>Compatibility</h2>
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {compatibilityEntries.map(([category, result]) => (
            <div key={category} style={{ border: "1px solid #27272a", borderRadius: 12, padding: "0.75rem" }}>
              <strong>{category}</strong>
              <div>Compatible: {result.compatible.length}</div>
              <div>Warnings: {result.warning.length}</div>
            </div>
          ))}
          {compatibilityEntries.length === 0 ? <div style={{ color: "#a1a1aa" }}>Compatibility panels will populate as option lookups return.</div> : null}
        </div>
      </section>
      <section>
        <h2 style={{ marginTop: 0 }}>Alternatives</h2>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {product.alternativeProducts.map((alternative) => (
            <Link key={alternative.id} href={`/products/${alternative.slug}`}>
              <div>{alternative.brand} {alternative.name}</div>
            </Link>
          ))}
          {product.alternativeProducts.length === 0 ? <div style={{ color: "#a1a1aa" }}>No alternatives found.</div> : null}
        </div>
      </section>
    </div>
  );
}
