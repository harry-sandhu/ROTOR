"use client";

import { useEffect, useMemo, useState } from "react";

import { apiGet, apiPost, apiPut, ApiError } from "../../lib/api";
import { useAuthState } from "../../hooks/use-auth-state";

interface Category {
  key: string;
  name: string;
  sortOrder: number;
}

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

interface CompatibilityIssue {
  status: "WARNING" | "INCOMPATIBLE";
  message: string;
}

interface CompatibilityEvaluation {
  overallStatus: "COMPATIBLE" | "WARNING" | "INCOMPATIBLE";
  validationStatus: "INCOMPLETE" | "VALID" | "VALID_WITH_WARNINGS" | "INVALID";
  score: number;
  totalCostCents: number;
  missingCategories: string[];
  issues: CompatibilityIssue[];
}

interface CompatibilityOptionsResponse {
  targetCategory: string;
  compatible: Array<{ product: ProductSummary; status: "COMPATIBLE"; reasons: string[] }>;
  warning: Array<{ product: ProductSummary; status: "WARNING"; reasons: string[] }>;
  incompatible: Array<{ product: ProductSummary; status: "INCOMPATIBLE"; reasons: string[] }>;
}

interface BuildDetail {
  id: string;
}

const quantityByCategory: Record<string, number> = {
  FRAME: 1,
  MOTOR: 4,
  ESC: 1,
  BATTERY: 1,
  PROPELLER: 4,
};

export function BuilderPageClient() {
  const { token, isAuthenticated } = useAuthState();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { productId: string; quantity: number; product: ProductSummary }>>({});
  const [options, setOptions] = useState<CompatibilityOptionsResponse | null>(null);
  const [evaluation, setEvaluation] = useState<CompatibilityEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [buildName, setBuildName] = useState("My Rotor Build");
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    void apiGet<Category[]>("/categories")
      .then((response) => {
        const ordered = [...response].sort((a, b) => a.sortOrder - b.sortOrder);
        setCategories(ordered);
        setActiveCategory((current) => current ?? ordered[0]?.key ?? null);
      })
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Failed to load categories."));
  }, []);

  useEffect(() => {
    if (!activeCategory) {
      return;
    }

    setLoadingOptions(true);
    setMessage(null);

    void apiPost<CompatibilityOptionsResponse>("/compatibility/options", {
      targetCategory: activeCategory,
      selections: Object.fromEntries(
        Object.entries(selections)
          .filter(([category]) => category !== activeCategory)
          .map(([category, selection]) => [category, { productId: selection.productId, quantity: selection.quantity }]),
      ),
    })
      .then(setOptions)
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Failed to load options."))
      .finally(() => setLoadingOptions(false));
  }, [activeCategory, selections]);

  useEffect(() => {
    const payload = Object.fromEntries(
      Object.entries(selections).map(([category, selection]) => [category, { productId: selection.productId, quantity: selection.quantity }]),
    );

    if (Object.keys(payload).length === 0) {
      setEvaluation(null);
      return;
    }

    void apiPost<CompatibilityEvaluation>("/compatibility/evaluate", { selections: payload })
      .then(setEvaluation)
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Failed to evaluate build."));
  }, [selections]);

  const currentOptions = useMemo(() => {
    if (!options) {
      return [] as Array<{ product: ProductSummary; status: string; reasons: string[] }>;
    }

    return [...options.compatible, ...options.warning];
  }, [options]);

  function selectProduct(product: ProductSummary) {
    if (!activeCategory) {
      return;
    }

    setSelections((current) => ({
      ...current,
      [activeCategory]: {
        productId: product.id,
        quantity: quantityByCategory[activeCategory] ?? 1,
        product,
      },
    }));
  }

  async function saveBuild() {
    if (!token || !isAuthenticated) {
      setMessage("Login is required to save builds.");
      return;
    }

    try {
      const build = await apiPost<BuildDetail>(
        "/builds",
        {
          name: buildName,
          visibility: "PRIVATE",
          description: "Saved from the Rotor web builder.",
        },
        token,
      );

      for (const [category, selection] of Object.entries(selections)) {
        await apiPut(
          `/builds/${build.id}/components/${category}`,
          {
            productId: selection.productId,
            quantity: selection.quantity,
          },
          token,
        );
      }

      setMessage(`Build saved successfully (${build.id}).`);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Failed to save build.");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: "1rem" }}>
      <section>
        <h1 style={{ marginTop: 0 }}>Builder</h1>
        <label style={{ display: "grid", gap: "0.25rem", marginBottom: "1rem" }}>
          <span>Build name</span>
          <input value={buildName} onChange={(event) => setBuildName(event.target.value)} />
        </label>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {categories.map((category) => {
            const selection = selections[category.key];
            return (
              <div key={category.key} style={{ border: "1px solid #27272a", borderRadius: 12, padding: "0.75rem" }}>
                <strong>{category.name}</strong>
                <div style={{ color: "#a1a1aa", marginTop: "0.35rem" }}>
                  {selection ? `${selection.product.brand} ${selection.product.name}` : "Not selected"}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
          <div>Score: {evaluation?.score ?? "—"}</div>
          <div>Status: {evaluation?.validationStatus ?? "INCOMPLETE"}</div>
          <div>Total: {evaluation ? `$${(evaluation.totalCostCents / 100).toFixed(2)}` : "$0.00"}</div>
          {evaluation?.issues.length ? (
            <ul style={{ paddingLeft: "1rem", margin: 0 }}>
              {evaluation.issues.map((issue, index) => (
                <li key={`${issue.message}-${index}`}>{issue.status}: {issue.message}</li>
              ))}
            </ul>
          ) : (
            <div style={{ color: "#a1a1aa" }}>No issues yet.</div>
          )}
          <button type="button" onClick={saveBuild}>Save build</button>
        </div>
        {message ? <p style={{ color: "#d4d4d8" }}>{message}</p> : null}
      </section>

      <section>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              style={{
                fontWeight: activeCategory === category.key ? 700 : 400,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        <h2 style={{ marginTop: 0 }}>Options for {activeCategory ?? "—"}</h2>
        {loadingOptions ? <p>Loading options...</p> : null}
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {currentOptions.map((option) => (
            <article key={option.product.id} style={{ border: "1px solid #27272a", borderRadius: 14, padding: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: "0.25rem" }}>{option.product.brand} {option.product.name}</h3>
                  <div style={{ color: "#a1a1aa", marginBottom: "0.5rem" }}>
                    ${(option.product.priceCents / 100).toFixed(2)} · {option.status}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {option.product.summarySpecs.map((spec) => (
                      <span key={spec.key} style={{ border: "1px solid #3f3f46", borderRadius: 999, padding: "0.15rem 0.55rem" }}>
                        {spec.label}: {spec.value}
                      </span>
                    ))}
                  </div>
                  {option.reasons.length ? (
                    <ul style={{ paddingLeft: "1rem", marginBottom: 0 }}>
                      {option.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                    </ul>
                  ) : null}
                </div>
                <div>
                  <button type="button" onClick={() => selectProduct(option.product)}>Select</button>
                </div>
              </div>
            </article>
          ))}
          {!loadingOptions && currentOptions.length === 0 ? <p>No options available for this category yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
