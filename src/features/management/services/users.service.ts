import { apiRequest } from "@/lib/api-client";

export type RosterUser = {
  id: string;
  name: string;
  role: string;
  status: string;
};

export type UserRole = "Super Admin" | "Admin" | "Supervisor" | "Field Executive" | "Viewer";
export type UserStatus = "Active" | "Inactive" | "Suspended";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
};

export type CreateUserFormValues = {
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  password: string;
};

export type UpdateUserFormValues = Omit<CreateUserFormValues, "password">;

export type BackendRole = "super_admin" | "admin" | "supervisor" | "field_executive" | "viewer";
export type BackendStatus = "active" | "inactive" | "suspended";

export const ROLE_TO_FRONTEND: Record<BackendRole, UserRole> = {
  super_admin: "Super Admin",
  admin: "Admin",
  supervisor: "Supervisor",
  field_executive: "Field Executive",
  viewer: "Viewer",
};

export const ROLE_TO_BACKEND: Record<UserRole, BackendRole> = {
  "Super Admin": "super_admin",
  Admin: "admin",
  Supervisor: "supervisor",
  "Field Executive": "field_executive",
  Viewer: "viewer",
};

export const STATUS_TO_FRONTEND: Record<BackendStatus, UserStatus> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

export const STATUS_TO_BACKEND: Record<UserStatus, BackendStatus> = {
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
};

type BackendUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile: string | null;
  role: BackendRole;
  status: BackendStatus;
  lastLoginAt: string | null;
};

function mapUser(raw: BackendUser): User {
  return {
    id: raw.id,
    name: raw.name,
    username: raw.username,
    email: raw.email,
    mobile: raw.mobile ?? "",
    role: ROLE_TO_FRONTEND[raw.role] ?? "Viewer",
    status: STATUS_TO_FRONTEND[raw.status] ?? "Active",
    lastLogin: raw.lastLoginAt ?? "",
  };
}

export const usersApi = {
  async list(params: { role?: string } = {}): Promise<RosterUser[]> {
    const query = new URLSearchParams();
    if (params.role) query.set("role", params.role);
    const qs = query.toString();
    return apiRequest<RosterUser[]>(`/users${qs ? `?${qs}` : ""}`);
  },

  async listFull(search?: string): Promise<User[]> {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    const qs = query.toString();
    const rows = await apiRequest<BackendUser[]>(`/users${qs ? `?${qs}` : ""}`);
    return rows.map(mapUser);
  },

  async create(values: CreateUserFormValues): Promise<User> {
    const raw = await apiRequest<BackendUser>("/users", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        username: values.username,
        email: values.email,
        mobile: values.mobile || undefined,
        role: ROLE_TO_BACKEND[values.role],
        status: STATUS_TO_BACKEND[values.status],
        password: values.password,
      }),
    });
    return mapUser(raw);
  },

  async update(id: string, values: UpdateUserFormValues): Promise<User> {
    const raw = await apiRequest<BackendUser>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: values.name,
        mobile: values.mobile || undefined,
        role: ROLE_TO_BACKEND[values.role],
        status: STATUS_TO_BACKEND[values.status],
      }),
    });
    return mapUser(raw);
  },

  async resetPassword(id: string, password: string): Promise<User> {
    const raw = await apiRequest<BackendUser>(`/users/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    return mapUser(raw);
  },
};
