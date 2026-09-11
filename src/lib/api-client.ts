const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
  meta?: { pagination?: PaginationMeta };
};

type RequestOptions = RequestInit & {
  skipRefresh?: boolean;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

let refreshPromise: Promise<void> | null = null;

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || "Request failed", response.status, payload?.code);
  }

  return payload ?? { success: true };
}

async function parseResponse<T>(response: Response) {
  const envelope = await readEnvelope<T>(response);
  return envelope.data as T;
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

const PUBLIC_PAGES = ["/login", "/privacy", "/support"];

function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (PUBLIC_PAGES.includes(window.location.pathname)) return;
  window.location.href = "/login";
}

async function fetchWithAuth(path: string, options: RequestOptions): Promise<Response> {
  const { skipRefresh, headers, ...init } = options;
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

    return retry;
  }

  return response;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetchWithAuth(path, options);
  return parseResponse<T>(response);
}

/**
 * Same as apiRequest, but also surfaces the server's pagination meta
 * (page/limit/total/totalPages) instead of discarding it - for genuine
 * server-paginated lists rather than "load everything, paginate in the
 * browser" endpoints.
 */
export async function apiRequestPaginated<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; pagination?: PaginationMeta }> {
  const response = await fetchWithAuth(path, options);
  const envelope = await readEnvelope<T>(response);
  return { data: envelope.data as T, pagination: envelope.meta?.pagination };
}
