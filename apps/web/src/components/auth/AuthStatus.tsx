"use client";

import Link from "next/link";

import { useAuthState } from "../../hooks/use-auth-state";

export function AuthStatus() {
  const { user, isAuthenticated, logout } = useAuthState();

  if (!isAuthenticated || !user) {
    return <Link href="/auth">Sign in</Link>;
  }

  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: "0.95rem", color: "#d4d4d8" }}>
        {user.displayName} · {user.role}
      </span>
      <button
        type="button"
        onClick={logout}
        style={{
          background: "transparent",
          color: "#fafafa",
          border: "1px solid #3f3f46",
          borderRadius: 10,
          padding: "0.35rem 0.6rem",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
