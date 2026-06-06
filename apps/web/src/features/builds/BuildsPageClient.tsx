"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuthState } from "../../hooks/use-auth-state";
import { apiGet, ApiError } from "../../lib/api";

interface BuildSummary {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  updatedAt: string;
}

export function BuildsPageClient() {
  const { token, isAuthenticated } = useAuthState();
  const [builds, setBuilds] = useState<BuildSummary[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      setMessage("Login to view saved builds.");
      setBuilds([]);
      return;
    }

    void apiGet<BuildSummary[]>("/builds", token)
      .then((response) => {
        setBuilds(response);
        setMessage(null);
      })
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Failed to load builds."));
  }, [token, isAuthenticated]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section>
        <h1 style={{ marginTop: 0 }}>Saved Builds</h1>
        <p style={{ color: "#a1a1aa" }}>Review saved builds, duplicate them, and open public shared views.</p>
      </section>
      {message ? <section><p style={{ margin: 0 }}>{message}</p></section> : null}
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {builds.map((build) => (
          <Link key={build.id} href={`/builds/${build.id}`}>
            <section>
              <h2 style={{ marginTop: 0, marginBottom: "0.3rem" }}>{build.name}</h2>
              <div style={{ color: "#a1a1aa" }}>{build.visibility} · Updated {new Date(build.updatedAt).toLocaleString()}</div>
              <p style={{ marginBottom: 0 }}>{build.description ?? "No description."}</p>
            </section>
          </Link>
        ))}
        {!message && builds.length === 0 ? <section><p style={{ margin: 0 }}>No builds saved yet.</p></section> : null}
      </div>
    </div>
  );
}
