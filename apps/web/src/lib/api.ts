export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildHeaders(input: { token?: string | undefined; init?: HeadersInit | undefined; hasJsonBody?: boolean | undefined }): Headers {
  const headers = new Headers(input.init);

  if (input.hasJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  if (input.token) {
    headers.set("Authorization", `Bearer ${input.token}`);
  }

  return headers;
}

export async function apiFetch<T>(path: string, init?: RequestInit & { token?: string | undefined }): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders({
      token: init?.token,
      init: init?.headers,
      hasJsonBody: typeof init?.body === "string",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string; details?: unknown };
    } | null;

    throw new ApiError(
      payload?.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.error?.details,
    );
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string, token?: string) {
  return apiFetch<T>(path, { method: "GET", token });
}

export function apiPost<T>(path: string, body: unknown, token?: string) {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
}

export function apiPatch<T>(path: string, body: unknown, token?: string) {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    token,
  });
}

export function apiPut<T>(path: string, body: unknown, token?: string) {
  return apiFetch<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    token,
  });
}

export function apiDelete<T>(path: string, token?: string) {
  return apiFetch<T>(path, { method: "DELETE", token });
}
