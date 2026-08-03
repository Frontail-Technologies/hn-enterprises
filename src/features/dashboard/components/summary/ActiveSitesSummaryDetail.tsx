"use client";

import { useMemo } from "react";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { useAllProjectSitesFullQuery } from "@/features/commercial/hooks/useAllProjectSites";
import type { ProjectSite } from "@/features/projects/types/project.types";
import { getActiveSites } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

const columns: ExcelColumn<ProjectSite>[] = [
  { key: "name", label: "Site Name", width: 220, sticky: true, getValue: (row) => row.name },
  { key: "code", label: "Site Code", width: 130, sticky: true, getValue: (row) => row.code },
  { key: "city", label: "City", width: 120, getValue: (row) => row.city },
  { key: "supervisor", label: "Supervisor", width: 170, getValue: (row) => row.supervisor },
  {
    key: "plannedConnections",
    label: "Planned Connections",
    width: 170,
    getValue: (row) => row.plannedConnections,
  },
  { key: "status", label: "Status", width: 130, getValue: (row) => row.status },
  { key: "remarks", label: "Remarks", width: 260, getValue: (row) => row.remarks },
];

export function ActiveSitesSummaryDetail({ city }: { city: string }) {
  const { data: projectSites = [], isLoading } = useAllProjectSitesFullQuery();
  const rows = useMemo(() => getActiveSites(projectSites, { city }), [projectSites, city]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("active-sites").title}
      searchPlaceholder="Search sites..."
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyTitle="No matching active sites found"
    />
  );
}
