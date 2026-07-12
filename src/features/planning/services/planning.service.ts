export type PlanningStatus = "Planned" | "In Progress" | "Completed" | "Delayed";

export type PlanningRecord = {
  id: string;
  date: string;
  supervisor: string;
  projectName: string;
  siteArea: string;
  activity: string;
  plannedQty: string;
  completedQty: string;
  status: PlanningStatus;
  delayReason: string;
  photoCount: number;
};

export const planningRecords: PlanningRecord[] = [
  {
    id: "plan-001",
    date: "2025-02-18",
    supervisor: "Amit Rathore",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block A",
    activity: "GI installation",
    plannedQty: "34 customers",
    completedQty: "28 customers",
    status: "In Progress",
    delayReason: "-",
    photoCount: 4,
  },
  {
    id: "plan-002",
    date: "2025-02-18",
    supervisor: "Kavita Joshi",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block B",
    activity: "GC correction visit",
    plannedQty: "18 customers",
    completedQty: "12 customers",
    status: "Delayed",
    delayReason: "Customer unavailable",
    photoCount: 3,
  },
  {
    id: "plan-003",
    date: "2025-02-17",
    supervisor: "Neha Verma",
    projectName: "Green City Phase 1",
    siteArea: "Commercial Block",
    activity: "Pressure testing",
    plannedQty: "10 tests",
    completedQty: "10 tests",
    status: "Completed",
    delayReason: "-",
    photoCount: 2,
  },
];

export const planningProjectOptions = Array.from(
  new Set(planningRecords.map((record) => record.projectName)),
).map((project) => ({ label: project, value: project }));

export const planningSupervisorOptions = Array.from(
  new Set(planningRecords.map((record) => record.supervisor)),
).map((supervisor) => ({ label: supervisor, value: supervisor }));
