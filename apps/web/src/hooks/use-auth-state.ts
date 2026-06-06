"use client";

import { useEffect, useState } from "react";

import { clearStoredAuth, getStoredToken, getStoredUser, subscribeToAuthChanges, type StoredAuthUser } from "../lib/auth";

export function useAuthState() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredAuthUser | null>(null);

  useEffect(() => {
    const sync = () => {
      setToken(getStoredToken());
      setUser(getStoredUser());
    };

    sync();
    return subscribeToAuthChanges(sync);
  }, []);

  return {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "ADMIN",
    logout: () => clearStoredAuth(),
  };
}
