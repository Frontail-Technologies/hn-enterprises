import type { StatusValue } from "@/components/shared/StatusBadge";

export type ProjectStatus =
  | "Draft"
  | "Active"
  | "In Progress"
  | "On Hold"
  | "Completed"
  | "Archived";

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
  supervisorId: string;
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
  documentName: string;
  documentDate: string;
  contractDate: string;
  issueDate: string;
  expiryDate: string;
  amount: string;
  category: string;
  fileName: string;
  fileUrl?: string;
  file?: File;
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

// GET /projects/:id/summary - lightweight KPI aggregation for the Overview
// tab (see projects-summary.service.ts on the backend for exactly how each
// number is computed).
export type ProjectSummary = {
  customers: {
    total: number;
    surveyDone: number;
    giDone: number;
    gcDone: number;
    conversionDone: number;
    jmrDone: number;
    jmrSubmittedInPbg: number;
    giBillDone: number;
    gcBillDone: number;
    conversionBillDone: number;
    connectionRemark: number;
  };
  sites: {
    total: number;
    active: number;
    list: {
      id: string;
      name: string;
      status: string;
      supervisorName: string | null;
      plannedConnections: number | null;
      customerCount: number;
    }[];
  };
  dpr: { pending: number; submittedThisMonth: number };
  expenses: { total: number };
  materials: { lowStockAlerts: number };
  team: { supervisors: number; plumbers: number; staff: number };
};

// GET /projects/:id/team - "people actually working on this project", never
// the global roster. See projects-team.service.ts for the derivation rules.
export type ProjectTeamSiteRef = { id: string; name: string };

export type ProjectTeamSupervisor = {
  id: string;
  name: string;
  role: "Supervisor";
  sites: ProjectTeamSiteRef[];
  customerCount: number;
  lastActivityAt: string | null;
};

export type ProjectTeamPlumber = {
  id: string;
  name: string;
  role: "Plumber";
  sites: ProjectTeamSiteRef[];
  customerCount: number;
  lastActivityAt: string | null;
};

export type ProjectTeamStaffMember = {
  id: string;
  name: string;
  designation: string;
  status: string;
};

export type ProjectTeam = {
  supervisors: ProjectTeamSupervisor[];
  plumbers: ProjectTeamPlumber[];
  staff: ProjectTeamStaffMember[];
};
