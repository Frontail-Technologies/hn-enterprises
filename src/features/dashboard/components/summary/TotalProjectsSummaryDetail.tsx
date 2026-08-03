"use client";

import { useMemo } from "react";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import type { Project } from "@/features/projects/types/project.types";
import { getScopedProjects } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

const columns: ExcelColumn<Project>[] = [
  { key: "name", label: "Project Name", width: 220, sticky: true, getValue: (row) => row.name },
  { key: "code", label: "Project Code", width: 140, sticky: true, getValue: (row) => row.code },
  { key: "city", label: "City", width: 120, getValue: (row) => row.city },
  { key: "client", label: "Client", width: 220, getValue: (row) => row.client },
  { key: "projectType", label: "Project Type", width: 150, getValue: (row) => row.projectType },
  { key: "status", label: "Status", width: 130, getValue: (row) => row.status },
  { key: "assignedManager", label: "Project Manager", width: 170, getValue: (row) => row.assignedManager },
];

export function TotalProjectsSummaryDetail({ projectId, city }: { projectId: string; city: string }) {
  const { data: projects = [], isLoading } = useProjectsQuery();
  const rows = useMemo(
    () => getScopedProjects(projects, { projectId, city }),
    [projects, projectId, city],
  );

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("total-projects").title}
      searchPlaceholder="Search projects..."
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyTitle="No matching projects found"
    />
  );
}
