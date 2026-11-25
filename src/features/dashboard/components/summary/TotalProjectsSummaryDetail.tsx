"use client";

import { useMemo } from "react";
import type { ListColumn } from "@/components/shared/list";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import type { Project } from "@/features/projects/types/project.types";
import { getScopedProjects } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

const columns: ListColumn<Project>[] = [
  { id: "name", header: "Project Name", width: 220, isTitle: true, hideable: false, sortable: true, columnFilter: true, value: (row) => row.name },
  { id: "code", header: "Project Code", width: 140, pin: true, sortable: true, columnFilter: true, value: (row) => row.code },
  { id: "city", header: "City", width: 120, sortable: true, columnFilter: true, value: (row) => row.city },
  { id: "client", header: "Client", width: 220, sortable: true, columnFilter: true, value: (row) => row.client },
  { id: "projectType", header: "Project Type", width: 150, sortable: true, columnFilter: true, value: (row) => row.projectType },
  { id: "status", header: "Status", width: 130, sortable: true, columnFilter: true, value: (row) => row.status },
  { id: "assignedManager", header: "Project Manager", width: 170, sortable: true, columnFilter: true, value: (row) => row.assignedManager },
];

export function TotalProjectsSummaryDetail({ projectId, city }: { projectId: string; city: string }) {
  const { data: projects = [], isLoading, isError, refetch } = useProjectsQuery();
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
      getRowHref={(row) => `/projects/${row.id}`}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      emptyIllustration="projects"
      emptyTitle="No matching projects found"
    />
  );
}
