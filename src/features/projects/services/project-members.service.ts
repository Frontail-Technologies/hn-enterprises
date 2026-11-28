import { apiRequest } from "@/lib/api-client";

/** A person on a project (current or, with removedAt, former). */
export type ProjectMember = {
  id: string;
  memberType: "supervisor" | "plumber";
  /** "supervisor" | "plumber" | "labour" */
  kind: "supervisor" | "plumber" | "labour";
  /** User id (supervisor) or plumber id (plumber / labour). */
  personId: string;
  name: string;
  /** Supervisors: "supervisor" | "site_manager" | "project_manager" (null if no staff record). */
  designation: string | null;
  avatarUrl: string | null;
  mobile: string | null;
  addedAt: string;
  addedByName: string | null;
  removedAt: string | null;
  removedByName: string | null;
};

export const projectMembersApi = {
  list: (projectId: string) => apiRequest<ProjectMember[]>(`/projects/${projectId}/members`),

  add: (projectId: string, body: { supervisorIds?: string[]; plumberIds?: string[] }) =>
    apiRequest<{ added: number }>(`/projects/${projectId}/members`, { method: "POST", body: JSON.stringify(body) }),

  remove: (projectId: string, memberId: string) =>
    apiRequest<{ id: string }>(`/projects/${projectId}/members/${memberId}`, { method: "DELETE" }),
};
