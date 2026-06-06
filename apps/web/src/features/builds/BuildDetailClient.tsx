"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuthState } from "../../hooks/use-auth-state";
import { apiGet, apiPost, ApiError } from "../../lib/api";

interface BuildDetail {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  components: Array<{
    category: string;
    quantity: number;
    product: {
      id: string;
      slug: string;
      brand: string;
      name: string;
      priceCents: number;
      summarySpecs: Array<{ key: string; label: string; value: string }>;
    };
  }>;
  evaluation?: {
    score: number;
    validationStatus: string;
    totalCostCents: number;
    issues: Array<{ status: string; message: string }>;
  };
}

export function BuildDetailClient({ buildId, shared = false }: { buildId: string; shared?: boolean }) {
  const { token, isAuthenticated } = useAuthState();
  const [build, setBuild] = useState<BuildDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const path = shared ? `/shared/builds/${buildId}` : `/builds/${buildId}`;
    const authToken = shared ? undefined : token ?? undefined;

    if (!shared && !authToken && !isAuthenticated) {
      setMessage("Login to view this build.");
      return;
    }

    void apiGet<BuildDetail>(path, authToken)
      .then((response) => {
        setBuild(response);
        setMessage(null);
      })
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Failed to load build."));
  }, [buildId, shared, token, isAuthenticated]);

  async function duplicateBuild() {
    if (!token) {
      setMessage("Login required to duplicate build.");
      return;
    }

    try {
      const response = await apiPost<BuildDetail>(`/builds/${buildId}/duplicate`, {}, token);
      setMessage(`Build duplicated: ${response.name}`);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Failed to duplicate build.");
    }
  }

  if (message && !build) {
    return <section><p style={{ margin: 0 }}>{message}</p></section>;
  }

  if (!build) {
    return <section><p style={{ margin: 0 }}>Loading build...</p></section>;
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section>
        <h1 style={{ marginTop: 0 }}>{build.name}</h1>
        <p>{build.description ?? "No description provided."}</p>
        <div style={{ color: "#a1a1aa" }}>Visibility: {build.visibility}</div>
        {!shared ? <button type="button" onClick={duplicateBuild} style={{ marginTop: "0.75rem" }}>Duplicate build</button> : null}
        {message ? <p style={{ marginBottom: 0 }}>{message}</p> : null}
      </section>
      <section>
        <h2 style={{ marginTop: 0 }}>Components</h2>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {build.components.map((component) => (
            <div key={`${component.category}-${component.product.id}`}>
              <strong>{component.category}</strong>: <Link href={`/products/${component.product.slug}`}>{component.product.brand} {component.product.name}</Link> × {component.quantity}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 style={{ marginTop: 0 }}>Build Health</h2>
        <div>Score: {build.evaluation?.score ?? "—"}</div>
        <div>Status: {build.evaluation?.validationStatus ?? "INCOMPLETE"}</div>
        <div>Total: {build.evaluation ? `$${(build.evaluation.totalCostCents / 100).toFixed(2)}` : "$0.00"}</div>
        {build.evaluation?.issues?.length ? (
          <ul style={{ paddingLeft: "1rem", marginBottom: 0 }}>
            {build.evaluation.issues.map((issue, index) => (
              <li key={`${issue.message}-${index}`}>{issue.status}: {issue.message}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
