export interface StoredAuthUser {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
}

const TOKEN_KEY = "rotor.auth.token";
const USER_KEY = "rotor.auth.user";
const EVENT_NAME = "rotor-auth-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredAuthUser | null {
  if (!isBrowser()) {
    return null;
  }

  const value = window.localStorage.getItem(USER_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredAuthUser;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: StoredAuthUser) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function clearStoredAuth() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function subscribeToAuthChanges(listener: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(EVENT_NAME, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(EVENT_NAME, listener);
    window.removeEventListener("storage", listener);
  };
}
