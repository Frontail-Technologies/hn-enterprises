import type { StatusValue } from "@/components/shared/StatusBadge";

export type ProjectStatus =
  | "Draft"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

export type Project = {
  id: string;
  name: string;
  code: string;
  client: string;
  consultant: string;
  contractor: string;
  projectType: string;
  city: string;
  area: string;
  description: string;
  startDate: string;
  plannedEndDate: string;
  status: ProjectStatus;
  contractValue: string;
  assignedManager: string;
};

export type ProjectSite = {
  id: string;
  name: string;
  code: string;
  city: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  supervisor: string;
  plannedConnections: number;
  startDate: string;
  endDate: string;
  status: StatusValue;
  remarks: string;
};

export type ProjectDocument = {
  id: string;
  type: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  amount: string;
  category: string;
  fileName: string;
  remarks: string;
  uploadedOn: string;
  uploadedBy: string;
};

export type AssignedUser = {
  id: string;
  name: string;
  role: string;
  siteArea: string;
  assignmentDate: string;
  status: StatusValue;
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  actor: string;
  dateTime: string;
  relatedRecord: string;
};

export type ProjectFormValues = Omit<Project, "id">;
