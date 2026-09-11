import type { Project, ProjectSite } from "@/features/projects/types/project.types";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";

export type DashboardScope = {
  projectId: string;
  city: string;
  period: DashboardMetricPeriod;
};

export function getScopedProjects(
  projects: Project[],
  { projectId, city }: Pick<DashboardScope, "projectId" | "city">,
) {
  return projects.filter((project) => {
    const projectMatch = projectId === "all" || project.id === projectId;
    const cityMatch = city === "all" || project.city === city;
    return projectMatch && cityMatch;
  });
}

export function getPeriodRange(period: DashboardMetricPeriod) {
  const now = new Date();
  if (period === "today") {
    return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: now };
  }
  if (period === "this-year") {
    return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
}

export function withinRange(value: string | undefined, range: { from: Date; to: Date }) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date >= range.from && date <= range.to;
}

export function getActiveSites(projectSites: ProjectSite[], { city }: Pick<DashboardScope, "city">) {
  return projectSites.filter((site) => {
    const cityMatch = city === "all" || site.city === city;
    return cityMatch && site.status !== "Not Started";
  });
}
