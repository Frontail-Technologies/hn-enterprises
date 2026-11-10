"use client";

import { useMemo } from "react";
import type { ListColumn } from "@/components/shared/list";
import { useAllProjectSitesFullQuery } from "@/features/commercial/hooks/useAllProjectSites";
import type { ProjectSite } from "@/features/projects/types/project.types";
import { getActiveSites } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

const columns: ListColumn<ProjectSite>[] = [
  { id: "name", header: "Site Name", width: 220, isTitle: true, hideable: false, sortable: true, columnFilter: true, value: (row) => row.name },
  { id: "code", header: "Site Code", width: 130, pin: true, sortable: true, columnFilter: true, value: (row) => row.code },
  { id: "city", header: "City", width: 120, sortable: true, columnFilter: true, value: (row) => row.city },
  { id: "supervisor", header: "Supervisor", width: 170, sortable: true, columnFilter: true, value: (row) => row.supervisor },
  { id: "plannedConnections", header: "Planned Connections", width: 170, align: "end", sortable: true, columnFilter: true, value: (row) => row.plannedConnections },
  { id: "status", header: "Status", width: 130, sortable: true, columnFilter: true, value: (row) => row.status },
  { id: "remarks", header: "Remarks", width: 260, grow: true, columnFilter: true, value: (row) => row.remarks },
];

export function ActiveSitesSummaryDetail({ city }: { city: string }) {
  const { data: projectSites = [], isLoading, isError, refetch } = useAllProjectSitesFullQuery();
  const rows = useMemo(() => getActiveSites(projectSites, { city }), [projectSites, city]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("active-sites").title}
      searchPlaceholder="Search sites..."
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      emptyIllustration="projects"
      emptyTitle="No matching active sites found"
    />
  );
}
