import type {
  DprRecord,
  DprTask,
  PlanTask,
  PlanningSupervisorProject,
  PlanningTaskTemplate,
  SiteOption,
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

export const planningSiteOptions: SiteOption[] = [
  { label: "Radha Nagar", value: "radha-nagar" },
  { label: "Shyam Nagar Block A", value: "shyam-a" },
  { label: "Shyam Nagar Block B", value: "shyam-b" },
  { label: "Metro Corridor, Shyam Nagar", value: "metro-stretch" },
];

export const siteAddressLabels = Object.fromEntries(
  planningSiteOptions.map((option) => [option.value, option.label]),
) as Record<string, string>;

export const planningSupervisors = [
  {
    id: "sup-amit",
    name: "Amit Rathore",
    area: "Radha Nagar",
    planningPercent: "82%",
    dprPercent: "76%",
    clientPercent: "71%",
  },
  {
    id: "sup-ramesh",
    name: "Ramesh Kumar",
    area: "Shyam Nagar Block A",
    planningPercent: "90%",
    dprPercent: "84%",
    clientPercent: "80%",
  },
  {
    id: "sup-kavita",
    name: "Kavita Joshi",
    area: "Shyam Nagar Block B",
    planningPercent: "68%",
    dprPercent: "62%",
    clientPercent: "59%",
  },
];

export const planningSupervisorProjects: PlanningSupervisorProject[] = [
  {
    id: "sup-amit-shyam",
    supervisorId: "sup-amit",
    supervisorName: "Amit Rathore",
    projectId: "shyam-nagar-cgd",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Radha Nagar",
    planningPercent: "82%",
    dprPercent: "76%",
    clientPercent: "71%",
    status: "In Progress",
  },
  {
    id: "sup-amit-jaipur",
    supervisorId: "sup-amit",
    supervisorName: "Amit Rathore",
    projectId: "city-gas-network-jaipur",
    projectName: "City Gas Network - Jaipur",
    siteArea: "Central Jaipur",
    planningPercent: "74%",
    dprPercent: "70%",
    clientPercent: "68%",
    status: "Pending",
  },
  {
    id: "sup-ramesh-shyam",
    supervisorId: "sup-ramesh",
    supervisorName: "Ramesh Kumar",
    projectId: "shyam-nagar-cgd",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block A",
    planningPercent: "90%",
    dprPercent: "84%",
    clientPercent: "80%",
    status: "In Progress",
  },
  {
    id: "sup-ramesh-green",
    supervisorId: "sup-ramesh",
    supervisorName: "Ramesh Kumar",
    projectId: "green-city-phase-1",
    projectName: "Green City Phase 1",
    siteArea: "Green City Township",
    planningPercent: "78%",
    dprPercent: "73%",
    clientPercent: "69%",
    status: "In Progress",
  },
  {
    id: "sup-kavita-shyam",
    supervisorId: "sup-kavita",
    supervisorName: "Kavita Joshi",
    projectId: "shyam-nagar-cgd",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block B",
    planningPercent: "68%",
    dprPercent: "62%",
    clientPercent: "59%",
    status: "Pending",
  },
  {
    id: "sup-kavita-sunrise",
    supervisorId: "sup-kavita",
    supervisorName: "Kavita Joshi",
    projectId: "sunrise-enclave-cgd",
    projectName: "Sunrise Enclave CGD",
    siteArea: "Sunrise Enclave",
    planningPercent: "72%",
    dprPercent: "66%",
    clientPercent: "64%",
    status: "In Progress",
  },
];

export function getPlanningSupervisorById(id?: string | null) {
  return planningSupervisors.find((supervisor) => supervisor.id === id) ?? planningSupervisors[0];
}

export function getPlanningProjectById(id?: string | null) {
  return planningSupervisorProjects.find((project) => project.projectId === id);
}

export function createSitePlan(index: number): SitePlan {
  return {
    id: `site-plan-${index}`,
    siteAddress: index === 1 ? "radha-nagar" : "shyam-a",
    tasks: planningTaskTemplates.map<PlanTask>((task) => ({
      ...task,
      qty: index === 1 ? "1" : "",
      worker:
        index === 1 && task.id === "survey"
          ? "Jabed"
          : index === 1 && task.id === "route"
            ? "Mukesh"
            : "",
    })),
  };
}

export function createDprTasks(): DprTask[] {
  return planningTaskTemplates.map((task) => ({
    ...task,
    plannedQty: "1",
    completedQty: task.id === "survey" ? "1" : "",
    worker:
      task.id === "survey"
        ? "Jabed"
        : task.id === "route"
          ? "Mukesh"
          : "",
    delayReason: "",
  }));
}

export const planningDprRecords: DprRecord[] = [
  {
    id: "dpr-2026-0710",
    date: "2026-07-10",
    siteAddress: "radha-nagar",
    status: "Submitted",
    photoCount: 3,
    remarks: "Daily work submitted by supervisor.",
    tasks: createDprTasks(),
  },
  {
    id: "dpr-2026-0709",
    date: "2026-07-09",
    siteAddress: "shyam-a",
    status: "Approved",
    photoCount: 5,
    remarks: "GI and route marker work completed.",
    tasks: createDprTasks().map((task) => ({
      ...task,
      completedQty: ["survey", "gi", "route"].includes(task.id) ? "1" : "",
    })),
  },
];
