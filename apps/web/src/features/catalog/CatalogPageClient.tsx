"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiGet, ApiError } from "../../lib/api";

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

interface ProductListResponse {
  items: ProductSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function CatalogPageClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState(false);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (category) query.set("category", category);
    if (inStock) query.set("inStock", "true");

    void apiGet<ProductListResponse>(`/products${query.toString() ? `?${query.toString()}` : ""}`)
      .then((response) => {
        setProducts(response.items);
        setMessage(null);
      })
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Failed to load products."));
  }, [search, category, inStock]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section>
        <h1 style={{ marginTop: 0 }}>Products</h1>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            <option value="FRAME">Frame</option>
            <option value="MOTOR">Motor</option>
            <option value="ESC">ESC</option>
            <option value="BATTERY">Battery</option>
            <option value="PROPELLER">Propeller</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} />
            In stock
          </label>
        </div>
      </section>
      {message ? <section><p style={{ margin: 0 }}>{message}</p></section> : null}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <section style={{ height: "100%" }}>
              <h2 style={{ marginTop: 0, marginBottom: "0.25rem" }}>{product.brand} {product.name}</h2>
              <div style={{ color: "#a1a1aa", marginBottom: "0.5rem" }}>
                {product.category} · ${(product.priceCents / 100).toFixed(2)}
              </div>
              <div style={{ display: "grid", gap: "0.35rem" }}>
                {product.summarySpecs.map((spec) => (
                  <div key={spec.key}>{spec.label}: {spec.value}</div>
                ))}
              </div>
            </section>
          </Link>
        ))}
      </div>
    </div>
  );
}
