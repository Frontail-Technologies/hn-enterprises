import { apiRequest } from "@/lib/api-client";
import type { WorkStage, WorkProgressStatus, WorkProgressUpdate, WorkQueueRow } from "../types/work-progress.types";

type BackendWorkStage = "survey" | "workable" | "plumbing_gi" | "gc" | "commissioning" | "conversion";
type BackendWorkProgressStatus = "not_started" | "pending" | "in_progress" | "completed" | "sent_back" | "on_hold";

const STAGE_TO_FRONTEND: Record<BackendWorkStage, WorkStage> = {
  survey: "Survey",
  workable: "Workable",
  plumbing_gi: "Plumbing / GI",
  gc: "GC",
  commissioning: "Commissioning",
  conversion: "Conversion",
};

const STATUS_TO_FRONTEND: Record<BackendWorkProgressStatus, WorkProgressStatus> = {
  not_started: "Not Started",
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  sent_back: "Sent Back",
  on_hold: "On Hold",
};

type BackendWorkProgressUpdate = {
  id: string;
  customerId: string;
  customer: { id: string; name: string; trBpNumber: string; mobileNumber: string | null } | null;
  project: { id: string; name: string } | null;
  site: { id: string; name: string } | null;
  stage: BackendWorkStage;
  status: BackendWorkProgressStatus;
  nextRequiredAction: string | null;
  remarks: string | null;
  evidence: { id: string; fileName: string; fileUrl: string }[] | null;
  createdAt: string;
  supervisor: { id: string; name: string } | null;
};

function mapWorkProgressUpdate(raw: BackendWorkProgressUpdate): WorkProgressUpdate {
  return {
    id: raw.id,
    customerId: raw.customerId,
    customer: raw.customer,
    project: raw.project,
    site: raw.site,
    stage: STAGE_TO_FRONTEND[raw.stage] ?? "Survey",
    status: STATUS_TO_FRONTEND[raw.status] ?? "Not Started",
    nextRequiredAction: raw.nextRequiredAction ?? "",
    remarks: raw.remarks ?? "",
    evidenceCount: raw.evidence?.length ?? 0,
    createdAt: raw.createdAt,
    supervisor: raw.supervisor,
  };
}

type BackendWorkQueueRow = {
  id: string;
  customerName: string;
  trBpNumber: string;
  mobileNumber: string | null;
  project: { id: string; name: string } | null;
  site: { id: string; name: string } | null;
  stage: BackendWorkStage;
  status: BackendWorkProgressStatus;
  nextRequiredAction: string | null;
  evidence: { id: string; fileName: string; fileUrl: string }[] | null;
  lastUpdated: string | null;
  supervisor: { id: string; name: string } | null;
};

function mapWorkQueueRow(raw: BackendWorkQueueRow): WorkQueueRow {
  return {
    id: raw.id,
    customerName: raw.customerName,
    trBpNumber: raw.trBpNumber,
    mobileNumber: raw.mobileNumber ?? "",
    project: raw.project,
    site: raw.site,
    stage: STAGE_TO_FRONTEND[raw.stage] ?? "Survey",
    status: STATUS_TO_FRONTEND[raw.status] ?? "Not Started",
    nextRequiredAction: raw.nextRequiredAction ?? "",
    evidenceCount: raw.evidence?.length ?? 0,
    lastUpdated: raw.lastUpdated ?? "",
    supervisor: raw.supervisor,
  };
}

export const workProgressApi = {
  async list(params: { customerId?: string; supervisorId?: string; limit?: number } = {}): Promise<WorkProgressUpdate[]> {
    const query = new URLSearchParams();
    if (params.customerId) query.set("customerId", params.customerId);
    if (params.supervisorId) query.set("supervisorId", params.supervisorId);
    if (params.limit) query.set("limit", String(params.limit));
    const rows = await apiRequest<BackendWorkProgressUpdate[]>(`/work-progress?${query.toString()}`);
    return rows.map(mapWorkProgressUpdate);
  },

  // "One row per customer, latest stage/status" queue - already supports
  // projectId server-side (work-progress.service.ts `listQueue`), reused
  // as-is for the Project Execution tab instead of re-deriving it client-side.
  async listQueue(
    params: { projectId?: string; siteId?: string; search?: string } = {},
  ): Promise<WorkQueueRow[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.siteId) query.set("siteId", params.siteId);
    if (params.search) query.set("search", params.search);
    const rows = await apiRequest<BackendWorkQueueRow[]>(`/work-progress/queue?${query.toString()}`);
    return rows.map(mapWorkQueueRow);
  },
};
