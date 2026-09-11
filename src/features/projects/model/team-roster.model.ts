import type { ProjectTeam } from "../types/project.types";
import { formatDate, toTitleCase } from "../components/detail/project-detail.utils";

export type TeamFilter = "all" | "supervisors" | "plumbers" | "staff";

export type TeamRow = {
  id: string;
  name: string;
  role: string;
  sites: string;
  workload: string;
  lastActivity: string;
};

export function buildTeamRows(
  supervisors: ProjectTeam["supervisors"],
  plumbers: ProjectTeam["plumbers"],
  staff: ProjectTeam["staff"],
  filter: TeamFilter,
): TeamRow[] {
  const supervisorRows: TeamRow[] = supervisors.map((person) => ({
    id: `supervisor-${person.id}`,
    name: person.name,
    role: "Supervisor",
    sites: person.sites.map((site) => site.name).join(", ") || "-",
    workload: `${person.customerCount} Customers`,
    lastActivity: person.lastActivityAt ? formatDate(person.lastActivityAt) : "-",
  }));
  const plumberRows: TeamRow[] = plumbers.map((person) => ({
    id: `plumber-${person.id}`,
    name: person.name,
    role: "Plumber",
    sites: person.sites.map((site) => site.name).join(", ") || "-",
    workload: `${person.customerCount} Customers`,
    lastActivity: person.lastActivityAt ? formatDate(person.lastActivityAt) : "-",
  }));
  const staffRows: TeamRow[] = staff.map((person) => ({
    id: `staff-${person.id}`,
    name: person.name,
    role: toTitleCase(person.designation),
    sites: "-",
    workload: "Assigned to this project",
    lastActivity: "-",
  }));

  if (filter === "supervisors") return supervisorRows;
  if (filter === "plumbers") return plumberRows;
  if (filter === "staff") return staffRows;
  return [...supervisorRows, ...plumberRows, ...staffRows];
}
