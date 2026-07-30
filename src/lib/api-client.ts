const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type RequestOptions = RequestInit & {
  skipRefresh?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || "Request failed", response.status);
  }

  return payload?.data as T;
}

async function refreshSession() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError("Session expired", response.status);
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipRefresh, headers, ...init } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (response.status === 401 && !skipRefresh && !path.startsWith("/auth/")) {
    await refreshSession();

    const retry = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    return parseResponse<T>(retry);
  }

  return parseResponse<T>(response);
}
