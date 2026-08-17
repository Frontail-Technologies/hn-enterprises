import { apiRequest } from "@/lib/api-client";
import type {
  DprRecord,
  DprTask,
  EvidenceFile,
  PlanTask,
  PlanningTaskTemplate,
  SitePlan,
} from "../types/planning.types";

export const planningTaskTemplates: PlanningTaskTemplate[] = [
  { id: "survey", label: "SURVEY" },
  { id: "gi", label: "GI" },
  { id: "gc", label: "GC" },
  { id: "laying", label: "LAYING" },
  { id: "valve", label: "VALVE CHAMBER" },
  { id: "pre", label: "PREE COMMISING" },
  { id: "conversion", label: "CONVERSION DONE" },
  { id: "jmr", label: "JMR DONE" },
  { id: "testing", label: "FLUSSHING/TESTING" },
  { id: "route", label: "ROUTE MARKER/POLE MARKER" },
  { id: "commissioning", label: "COMMISSING" },
];

type BackendPlanTask = { id: string; qty?: string; worker?: string };
type BackendDprTask = {
  id: string;
  plannedQty?: string;
  completedQty?: string;
  worker?: string;
  delayReason?: string;
};
type BackendEvidenceFile = { id: string; fileName: string; fileUrl: string; mimeType?: string; capturedAt?: string };
type BackendJoinedRef = { id: string; name: string } | null;

type BackendCustomerRef = { id: string; name: string; trBpNumber: string } | null;

type BackendSitePlan = {
  id: string;
  customerId: string;
  projectId: string;
  siteId: string;
  date: string;
  supervisorId: string;
  tasks: BackendPlanTask[];
  supervisor: BackendJoinedRef;
  site: { id: string; name: string; address: string | null } | null;
  project: BackendJoinedRef;
  customer: BackendCustomerRef;
};

type BackendDprRecord = {
  id: string;
  customerId: string;
  projectId: string;
  siteId: string;
  date: string;
  supervisorId: string;
  status: "draft" | "submitted" | "approved";
  remarks: string | null;
  tasks: BackendDprTask[];
  evidence: BackendEvidenceFile[] | null;
  submittedAt: string | null;
  supervisor: BackendJoinedRef;
  site: { id: string; name: string; address: string | null } | null;
  project: BackendJoinedRef;
  customer: BackendCustomerRef;
};

const STATUS_TO_FRONTEND: Record<string, DprRecord["status"]> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
};

function mapTasksToPlanTasks(tasks: BackendPlanTask[]): PlanTask[] {
  return planningTaskTemplates.map((template) => {
    const match = tasks.find((task) => task.id === template.id);
    return { ...template, qty: match?.qty ?? "", worker: match?.worker ?? "" };
  });
}

function mapTasksToDprTasks(tasks: BackendDprTask[]): DprTask[] {
  return planningTaskTemplates.map((template) => {
    const match = tasks.find((task) => task.id === template.id);
    return {
      ...template,
      plannedQty: match?.plannedQty ?? "",
      completedQty: match?.completedQty ?? "",
      worker: match?.worker ?? "",
      delayReason: match?.delayReason ?? "",
    };
  });
}

function mapEvidence(files: BackendEvidenceFile[] | null): EvidenceFile[] {
  return (files ?? []).map((file) => ({
    id: file.id,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    mimeType: file.mimeType,
    capturedAt: file.capturedAt,
  }));
}

function mapSitePlan(raw: BackendSitePlan): SitePlan {
  return {
    id: raw.id,
    customerId: raw.customerId,
    customerName: raw.customer?.name ?? "",
    customerTrBpNo: raw.customer?.trBpNumber ?? "",
    projectId: raw.projectId,
    siteId: raw.siteId,
    siteLabel: raw.site?.name ?? "",
    supervisorId: raw.supervisorId,
    supervisorName: raw.supervisor?.name ?? "",
    tasks: mapTasksToPlanTasks(raw.tasks),
  };
}

function mapDprRecord(raw: BackendDprRecord): DprRecord {
  return {
    id: raw.id,
    date: raw.date,
    customerId: raw.customerId,
    customerName: raw.customer?.name ?? "",
    customerTrBpNo: raw.customer?.trBpNumber ?? "",
    projectId: raw.projectId,
    siteId: raw.siteId,
    siteLabel: raw.site?.name ?? "",
    supervisorId: raw.supervisorId,
    supervisorName: raw.supervisor?.name ?? "",
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    evidence: mapEvidence(raw.evidence),
    remarks: raw.remarks ?? "",
    tasks: mapTasksToDprTasks(raw.tasks),
  };
}

type ListParams = {
  projectId?: string;
  siteId?: string;
  supervisorId?: string;
  customerId?: string;
  date?: string;
  from?: string;
  to?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();
  if (params.projectId) query.set("projectId", params.projectId);
  if (params.siteId) query.set("siteId", params.siteId);
  if (params.supervisorId) query.set("supervisorId", params.supervisorId);
  if (params.customerId) query.set("customerId", params.customerId);
  if (params.date) query.set("date", params.date);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  return query.toString();
}

export const planningApi = {
  async listSitePlans(params: ListParams = {}): Promise<SitePlan[]> {
    const rows = await apiRequest<BackendSitePlan[]>(`/planning/site-plans?${buildQuery(params)}`);
    return rows.map(mapSitePlan);
  },

  async listDprRecords(params: ListParams = {}): Promise<DprRecord[]> {
    const rows = await apiRequest<BackendDprRecord[]>(`/planning/dpr-records?${buildQuery(params)}`);
    return rows.map(mapDprRecord);
  },
};
