const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
};

type RequestOptions = RequestInit & {
  skipRefresh?: boolean;
};

export class ApiError extends Error {
  status: number;
  /** App-level error code from the response body, e.g. "ENTITY_IN_USE" (§9) - lets
   * callers distinguish a specific, known failure from a generic one without
   * string-matching the message. */
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

let refreshPromise: Promise<void> | null = null;

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || "Request failed", response.status, payload?.code);
  }

  return payload?.data as T;
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      await parseResponse<unknown>(response);
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function shouldAttemptRefresh(path: string, skipRefresh?: boolean) {
  if (skipRefresh) return false;
  return ![
    "/auth/login",
    "/auth/refresh",
    "/auth/logout",
    "/auth/request-password-reset",
    "/auth/reset-password",
  ].includes(path);
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  window.location.href = "/login";
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipRefresh, headers, ...init } = options;
  // FormData bodies must not get a manual Content-Type - the browser sets the multipart
  // boundary itself. Only default to JSON for plain (string/undefined) bodies.
  const isFormData = init.body instanceof FormData;
  const requestHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: requestHeaders,
  });

  if (response.status === 401 && shouldAttemptRefresh(path, skipRefresh)) {
    try {
      await refreshSession();
    } catch (error) {
      redirectToLogin();
      throw error;
    }

    const retry = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: requestHeaders,
    });

    if (retry.status === 401) {
      redirectToLogin();
    }

    return parseResponse<T>(retry);
  }

  return parseResponse<T>(response);
}
