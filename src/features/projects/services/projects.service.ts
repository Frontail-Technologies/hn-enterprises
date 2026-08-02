import { apiRequest } from "@/lib/api-client";
import type { Project, ProjectDocument, ProjectFormValues, ProjectSite } from "../types/project.types";
import type { StatusValue } from "@/components/shared/StatusBadge";

export const projectStatusOptions = [
  "Draft",
  "Active",
  "In Progress",
  "On Hold",
  "Completed",
  "Archived",
] as const;

type BackendProjectStatus = "draft" | "active" | "in_progress" | "on_hold" | "completed" | "archived";
type BackendSiteStatus = "active" | "in_progress" | "not_started" | "on_hold" | "completed" | "archived";

const STATUS_TO_FRONTEND: Record<BackendProjectStatus, Project["status"]> = {
  draft: "Draft",
  active: "Active",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_TO_BACKEND: Record<Project["status"], BackendProjectStatus> = {
  Draft: "draft",
  Active: "active",
  "In Progress": "in_progress",
  "On Hold": "on_hold",
  Completed: "completed",
  Archived: "archived",
};

const SITE_STATUS_TO_BACKEND: Record<string, BackendSiteStatus> = {
  Active: "active",
  "In Progress": "in_progress",
  "Not Started": "not_started",
  "On Hold": "on_hold",
  Completed: "completed",
  Archived: "archived",
};

function toDateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function formatCurrency(value: string | number | null | undefined) {
  if (value == null || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseCurrency(value: string) {
  const digits = value.replace(/[^0-9.]/g, "");
  return digits ? Number(digits) : undefined;
}

type BackendProject = {
  id: string;
  name: string;
  code: string | null;
  city: string | null;
  client: string | null;
  consultant: string | null;
  contractor: string | null;
  projectType: string | null;
  areaLocation: string | null;
  description: string | null;
  startDate: string | null;
  plannedEndDate: string | null;
  status: BackendProjectStatus;
  contractValue: string | null;
  projectManager: string | null;
};

type BackendProjectSite = {
  id: string;
  name: string;
  code: string | null;
  city: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  plannedConnections: number | null;
  supervisorId: string | null;
  supervisorName: string | null;
  startDate: string | null;
  endDate: string | null;
  remarks: string | null;
  status: BackendSiteStatus;
};

type BackendProjectDocument = {
  id: string;
  siteId: string | null;
  documentType: string;
  referenceNumber: string | null;
  documentDate: string | null;
  expiryDate: string | null;
  amount: string | null;
  fileUrl: string;
  fileName: string;
  status: string;
  remarks: string | null;
  uploadedAt: string;
};

function mapProject(raw: BackendProject): Project {
  return {
    id: raw.id,
    name: raw.name,
    code: raw.code ?? "",
    client: raw.client ?? "",
    consultant: raw.consultant ?? "",
    contractor: raw.contractor ?? "",
    projectType: raw.projectType ?? "",
    city: raw.city ?? "",
    area: raw.areaLocation ?? "",
    description: raw.description ?? "",
    startDate: toDateOnly(raw.startDate),
    plannedEndDate: toDateOnly(raw.plannedEndDate),
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    contractValue: formatCurrency(raw.contractValue),
    assignedManager: raw.projectManager ?? "",
  };
}

function mapProjectFormToBody(values: ProjectFormValues) {
  return {
    name: values.name,
    code: values.code || undefined,
    city: values.city || undefined,
    client: values.client || undefined,
    consultant: values.consultant || undefined,
    contractor: values.contractor || undefined,
    projectType: values.projectType || undefined,
    areaLocation: values.area || undefined,
    description: values.description || undefined,
    startDate: values.startDate || undefined,
    plannedEndDate: values.plannedEndDate || undefined,
    status: STATUS_TO_BACKEND[values.status],
    contractValue: parseCurrency(values.contractValue),
    projectManager: values.assignedManager || undefined,
  };
}

function mapProjectSite(raw: BackendProjectSite): ProjectSite {
  const statusLabel = (Object.entries(SITE_STATUS_TO_BACKEND).find(([, v]) => v === raw.status)?.[0] ??
    "Active") as StatusValue;

  return {
    id: raw.id,
    name: raw.name,
    code: raw.code ?? "",
    city: raw.city ?? "",
    fullAddress: raw.address ?? "",
    latitude: raw.latitude ? Number(raw.latitude) : 0,
    longitude: raw.longitude ? Number(raw.longitude) : 0,
    supervisorId: raw.supervisorId ?? "",
    supervisor: raw.supervisorName ?? "",
    plannedConnections: raw.plannedConnections ?? 0,
    startDate: toDateOnly(raw.startDate),
    endDate: toDateOnly(raw.endDate),
    status: statusLabel,
    remarks: raw.remarks ?? "",
  };
}

function mapProjectSiteToBody(site: ProjectSite) {
  return {
    name: site.name,
    code: site.code || undefined,
    city: site.city || undefined,
    address: site.fullAddress || undefined,
    latitude: site.latitude || undefined,
    longitude: site.longitude || undefined,
    plannedConnections: site.plannedConnections || undefined,
    supervisorId: site.supervisorId || undefined,
    startDate: site.startDate || undefined,
    endDate: site.endDate || undefined,
    remarks: site.remarks || undefined,
    status: SITE_STATUS_TO_BACKEND[site.status] ?? "active",
  };
}

function mapProjectDocument(raw: BackendProjectDocument): ProjectDocument {
  return {
    id: raw.id,
    type: raw.documentType,
    number: raw.referenceNumber ?? "",
    documentName: raw.documentType,
    documentDate: toDateOnly(raw.documentDate),
    contractDate: toDateOnly(raw.documentDate),
    issueDate: toDateOnly(raw.documentDate),
    expiryDate: toDateOnly(raw.expiryDate),
    amount: formatCurrency(raw.amount),
    category: raw.documentType,
    fileName: raw.fileName,
    fileUrl: raw.fileUrl,
    remarks: raw.remarks ?? "",
    uploadedOn: toDateOnly(raw.uploadedAt),
    uploadedBy: "",
  };
}

function mapProjectDocumentToBody(doc: ProjectDocument) {
  return {
    documentType: doc.type || doc.category,
    referenceNumber: doc.number || undefined,
    documentDate: doc.documentDate || undefined,
    expiryDate: doc.expiryDate || undefined,
    amount: parseCurrency(doc.amount),
    fileUrl: doc.fileUrl || (doc.fileName ? `uploads/${doc.fileName}` : "uploads/document.pdf"),
    fileName: doc.fileName || "document.pdf",
    remarks: doc.remarks || undefined,
  };
}

export const projectsApi = {
  async list(search?: string): Promise<Project[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (search) query.set("search", search);
    const rows = await apiRequest<BackendProject[]>(`/projects?${query.toString()}`);
    return rows.map(mapProject);
  },

  async get(id: string): Promise<Project> {
    const raw = await apiRequest<BackendProject>(`/projects/${id}`);
    return mapProject(raw);
  },

  async create(values: ProjectFormValues): Promise<Project> {
    const raw = await apiRequest<BackendProject>("/projects", {
      method: "POST",
      body: JSON.stringify(mapProjectFormToBody(values)),
    });
    return mapProject(raw);
  },

  async update(id: string, values: ProjectFormValues): Promise<Project> {
    const raw = await apiRequest<BackendProject>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(mapProjectFormToBody(values)),
    });
    return mapProject(raw);
  },

  async listSites(projectId: string): Promise<ProjectSite[]> {
    const rows = await apiRequest<BackendProjectSite[]>(`/projects/${projectId}/sites`);
    return rows.map(mapProjectSite);
  },

  async createSite(projectId: string, site: ProjectSite): Promise<ProjectSite> {
    const raw = await apiRequest<BackendProjectSite>(`/projects/${projectId}/sites`, {
      method: "POST",
      body: JSON.stringify(mapProjectSiteToBody(site)),
    });
    return mapProjectSite(raw);
  },

  async updateSite(projectId: string, site: ProjectSite): Promise<ProjectSite> {
    const raw = await apiRequest<BackendProjectSite>(`/projects/${projectId}/sites/${site.id}`, {
      method: "PATCH",
      body: JSON.stringify(mapProjectSiteToBody(site)),
    });
    return mapProjectSite(raw);
  },

  async listDocuments(projectId: string): Promise<ProjectDocument[]> {
    const rows = await apiRequest<BackendProjectDocument[]>(`/projects/${projectId}/documents`);
    return rows.map(mapProjectDocument);
  },

  async createDocument(projectId: string, doc: ProjectDocument): Promise<ProjectDocument> {
    const raw = await apiRequest<BackendProjectDocument>(`/projects/${projectId}/documents`, {
      method: "POST",
      body: JSON.stringify(mapProjectDocumentToBody(doc)),
    });
    return mapProjectDocument(raw);
  },
};
