"use client";

import { useState } from "react";

import { setStoredAuth } from "../../lib/auth";
import { apiPost, ApiError } from "../../lib/api";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: "USER" | "ADMIN";
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export function AuthPageClient() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@rotor.app");
  const [password, setPassword] = useState("RotorDemo123!");
  const [displayName, setDisplayName] = useState("Rotor Pilot");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await apiPost<AuthResponse>(
        mode === "login" ? "/auth/login" : "/auth/register",
        mode === "login"
          ? { email, password }
          : {
              email,
              password,
              displayName,
            },
      );

      setStoredAuth(response.tokens.accessToken, response.user);
      setMessage(`Signed in as ${response.user.displayName} (${response.user.role}).`);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section>
        <h1 style={{ marginTop: 0 }}>Authentication</h1>
        <p style={{ color: "#d4d4d8" }}>
          Use the seeded demo accounts or register a new one. Seeded accounts: demo@rotor.app and admin@rotor.app with password RotorDemo123!
        </p>
      </section>
      <section>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
          <button type="button" onClick={() => setMode("login")}>Login</button>
          <button type="button" onClick={() => setMode("register")}>Register</button>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@rotor.app");
              setPassword("RotorDemo123!");
              setMode("login");
            }}
          >
            Use Admin Demo
          </button>
        </div>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem", maxWidth: 460 }}>
          <label>
            <div>Email</div>
            <input value={email} onChange={(event) => setEmail(event.target.value)} style={{ width: "100%" }} />
          </label>
          <label>
            <div>Password</div>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ width: "100%" }} />
          </label>
          {mode === "register" ? (
            <label>
              <div>Display name</div>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} style={{ width: "100%" }} />
            </label>
          ) : null}
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
        {message ? <p style={{ marginBottom: 0, color: "#a1a1aa" }}>{message}</p> : null}
      </section>
    </div>
  );
}
