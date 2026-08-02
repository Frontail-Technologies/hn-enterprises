import { apiRequest } from "@/lib/api-client";
import type { WorkStage, WorkProgressStatus, WorkProgressUpdate } from "../types/work-progress.types";

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

export const workProgressApi = {
  async list(params: { customerId?: string; supervisorId?: string; limit?: number } = {}): Promise<WorkProgressUpdate[]> {
    const query = new URLSearchParams();
    if (params.customerId) query.set("customerId", params.customerId);
    if (params.supervisorId) query.set("supervisorId", params.supervisorId);
    if (params.limit) query.set("limit", String(params.limit));
    const rows = await apiRequest<BackendWorkProgressUpdate[]>(`/work-progress?${query.toString()}`);
    return rows.map(mapWorkProgressUpdate);
  },
};
