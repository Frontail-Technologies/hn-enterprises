import { apiRequest } from "@/lib/api-client";
import type { AuthUser, LoginCredentials } from "@/types/auth";

type BackendUser = {
  id: string;
  name: string;
  username: string;
  email?: string;
  mobile?: string | null;
  role: AuthUser["role"];
  status?: string;
  lastLoginAt?: string | null;
};

function mapUser(user: BackendUser): AuthUser {
  return {
    id: user.id,
    username: user.username,
    fullName: user.name,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
    lastLogin: user.lastLoginAt,
    lastLoginAt: user.lastLoginAt,
    isActive: user.status === "active",
    assignedProjects: [],
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const user = await apiRequest<BackendUser>("/auth/login", {
      method: "POST",
      skipRefresh: true,
      body: JSON.stringify({
        identifier: credentials.username,
        password: credentials.password,
        clientType: "admin",
      }),
    });

    return mapUser(user);
  },

  async logout(): Promise<void> {
    await apiRequest<void>("/auth/logout", {
      method: "POST",
      skipRefresh: true,
    }).catch(() => undefined);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await apiRequest<BackendUser>("/auth/me");
      return mapUser(user);
    } catch {
      return null;
    }
  },

  async requestPasswordReset(identifier: string) {
    return apiRequest<{ resetToken: string | null }>("/auth/request-password-reset", {
      method: "POST",
      skipRefresh: true,
      body: JSON.stringify({ identifier }),
    });
  },
};
