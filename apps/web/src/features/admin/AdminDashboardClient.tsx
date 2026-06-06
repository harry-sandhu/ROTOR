"use client";

import { useEffect, useState } from "react";

import { useAuthState } from "../../hooks/use-auth-state";
import { apiGet, apiPost, ApiError } from "../../lib/api";

export function AdminDashboardClient() {
  const { token, isAdmin } = useAuthState();
  const [specKey, setSpecKey] = useState("flightControllerMount");
  const [specName, setSpecName] = useState("Flight Controller Mount");
  const [specs, setSpecs] = useState<Array<{ id: string; key: string; name: string }>>([]);
  const [rules, setRules] = useState<Array<{ id: string; key: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; category: string }>>([]);
  const [importJson, setImportJson] = useState('[\n  {\n    "slug": "demo-admin-product",\n    "name": "Demo Admin Product",\n    "brand": "Rotor Labs",\n    "categoryKey": "FRAME",\n    "description": "Admin import example",\n    "priceCents": 9999,\n    "stockQuantity": 5,\n    "status": "DRAFT",\n    "specs": {\n      "wheelbase": 225,\n      "maxPropSize": 5,\n      "stackMount": "30x30",\n      "motorMountPattern": "16x16"\n    },\n    "images": []\n  }\n]');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isAdmin) {
      return;
    }

    void Promise.all([
      apiGet<Array<{ id: string; key: string; name: string }>>("/admin/specifications", token),
      apiGet<Array<{ id: string; key: string; name: string }>>("/admin/rules", token),
      apiGet<Array<{ id: string; name: string; category: string }>>("/admin/products", token),
    ])
      .then(([specResponse, ruleResponse, productResponse]) => {
        setSpecs(specResponse);
        setRules(ruleResponse);
        setProducts(productResponse);
      })
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Failed to load admin data."));
  }, [token, isAdmin]);

  async function createSpecification() {
    if (!token) return;

    try {
      const response = await apiPost<{ id: string; key: string; name: string }>(
        "/admin/specifications",
        {
          key: specKey,
          name: specName,
          dataType: "TEXT",
          validation: {},
          searchWeight: 0,
          isFilterable: false,
          isSearchable: false,
        },
        token,
      );

      setSpecs((current) => [...current, response]);
      setMessage(`Created specification ${response.key}.`);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Failed to create specification.");
    }
  }

  async function previewImport() {
    if (!token) return;

    try {
      const items = JSON.parse(importJson) as unknown[];
      const response = await apiPost<{ results: Array<{ slug: string; success: boolean; issues: Array<{ message: string }> }> }>(
        "/admin/import/products",
        { commit: false, items },
        token,
      );
      setMessage(response.results.map((item) => `${item.slug}: ${item.success ? "ok" : item.issues.map((issue) => issue.message).join(", ")}`).join(" | "));
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Failed to preview import JSON.");
    }
  }

  if (!token || !isAdmin) {
    return (
      <section>
        <h1 style={{ marginTop: 0 }}>Admin</h1>
        <p>Login as an admin user to access catalog management tools.</p>
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section>
        <h1 style={{ marginTop: 0 }}>Admin</h1>
        <p style={{ color: "#a1a1aa" }}>Manage specifications, rules, products, and import/export workflows.</p>
        {message ? <p style={{ marginBottom: 0 }}>{message}</p> : null}
      </section>
      <section>
        <h2 style={{ marginTop: 0 }}>Create specification</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input value={specKey} onChange={(event) => setSpecKey(event.target.value)} placeholder="key" />
          <input value={specName} onChange={(event) => setSpecName(event.target.value)} placeholder="name" />
          <button type="button" onClick={createSpecification}>Create</button>
        </div>
      </section>
      <section>
        <h2 style={{ marginTop: 0 }}>Import preview</h2>
        <textarea value={importJson} onChange={(event) => setImportJson(event.target.value)} rows={14} style={{ width: "100%" }} />
        <div style={{ marginTop: "0.75rem" }}>
          <button type="button" onClick={previewImport}>Preview import</button>
        </div>
      </section>
      <section>
        <h2 style={{ marginTop: 0 }}>Current metadata</h2>
        <div>Specifications: {specs.length}</div>
        <div>Rules: {rules.length}</div>
        <div>Products: {products.length}</div>
      </section>
    </div>
  );
}
