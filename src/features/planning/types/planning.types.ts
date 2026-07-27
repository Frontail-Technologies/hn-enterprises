export type PlanningTaskId =
  | "survey"
  | "gi"
  | "gc"
  | "laying"
  | "valve"
  | "pre"
  | "conversion"
  | "jmr"
  | "testing"
  | "route"
  | "commissioning";

export type PlanningTaskTemplate = {
  id: PlanningTaskId;
  label: string;
};

export type SiteOption = {
  label: string;
  value: string;
};

export type PlanTask = {
  id: PlanningTaskId;
  label: string;
  qty: string;
  worker: string;
};

export type SitePlan = {
  id: string;
  siteAddress: string;
  tasks: PlanTask[];
};

export type DprTask = {
  id: PlanningTaskId;
  label: string;
  plannedQty: string;
  completedQty: string;
  worker: string;
  delayReason: string;
};

export type DprRecord = {
  id: string;
  date: string;
  siteAddress: string;
  status: "Draft" | "Submitted" | "Approved";
  photoCount: number;
  remarks: string;
  tasks: DprTask[];
};

export type PlanningSupervisorProject = {
  id: string;
  supervisorId: string;
  supervisorName: string;
  projectId: string;
  projectName: string;
  siteArea: string;
  planningPercent: string;
  dprPercent: string;
  clientPercent: string;
  status: "In Progress" | "Completed" | "Pending";
};
