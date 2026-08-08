import { apiRequest } from "@/lib/api-client";
import type { Complaint, ComplaintFormValues, ComplaintPriority, ComplaintStatus } from "../types/complaint.types";

type BackendComplaintPriority = "low" | "medium" | "high";
type BackendComplaintStatus = "open" | "in_progress" | "resolved" | "closed";

const PRIORITY_TO_FRONTEND: Record<BackendComplaintPriority, ComplaintPriority> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const PRIORITY_TO_BACKEND: Record<ComplaintPriority, BackendComplaintPriority> = {
  Low: "low",
  Medium: "medium",
  High: "high",
};

const STATUS_TO_FRONTEND: Record<BackendComplaintStatus, ComplaintStatus> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_TO_BACKEND: Record<ComplaintStatus, BackendComplaintStatus> = {
  Open: "open",
  "In Progress": "in_progress",
  Resolved: "resolved",
  Closed: "closed",
};

type BackendComplaint = {
  id: string;
  customerId: string;
  title: string;
  description: string;
  priority: BackendComplaintPriority;
  status: BackendComplaintStatus;
  supervisorRemark: string | null;
  createdAt: string;
};

function mapComplaint(raw: BackendComplaint): Complaint {
  return {
    id: raw.id,
    customerId: raw.customerId,
    title: raw.title,
    description: raw.description,
    priority: PRIORITY_TO_FRONTEND[raw.priority] ?? "Medium",
    status: STATUS_TO_FRONTEND[raw.status] ?? "Open",
    supervisorRemark: raw.supervisorRemark ?? "",
    createdAt: raw.createdAt,
  };
}

export const complaintsApi = {
  async list(params: { customerId?: string; status?: ComplaintStatus } = {}): Promise<Complaint[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.customerId) query.set("customerId", params.customerId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    const rows = await apiRequest<BackendComplaint[]>(`/complaints?${query.toString()}`);
    return rows.map(mapComplaint);
  },

  async create(values: ComplaintFormValues): Promise<Complaint> {
    const raw = await apiRequest<BackendComplaint>("/complaints", {
      method: "POST",
      body: JSON.stringify({
        customerId: values.customerId,
        title: values.title,
        description: values.description,
        priority: PRIORITY_TO_BACKEND[values.priority],
      }),
    });
    return mapComplaint(raw);
  },

  async update(id: string, values: Partial<ComplaintFormValues>): Promise<Complaint> {
    const raw = await apiRequest<BackendComplaint>(`/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(
        Object.fromEntries(
          Object.entries({
            customerId: values.customerId,
            title: values.title,
            description: values.description,
            priority: values.priority ? PRIORITY_TO_BACKEND[values.priority] : undefined,
          }).filter(([, value]) => value !== undefined),
        ),
      ),
    });
    return mapComplaint(raw);
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/complaints/${id}`, {
      method: "DELETE",
    });
  },
};
