"use client";

import { UserGearIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DataTable } from "@/components/shared/DataTable";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { formatCompactCount } from "@/lib/format";
import type { TeamFilter } from "../../model/team-roster.model";
import { useProjectTeamTab } from "./hooks/useProjectTeamTab";
import { teamColumns } from "./ProjectTeamTab.columns";
import { ProjectTabHeader } from "./ProjectTabHeader";

const TEAM_EMPTY_MESSAGES: Record<TeamFilter, string> = {
  all: "No active team members found for this project.",
  supervisors: "No supervisors are currently working on this project.",
  plumbers: "No plumbers are currently working on this project.",
  staff: "No staff members are assigned to this project.",
};

export function ProjectTeamTab({ projectId, active }: { projectId: string; active: boolean }) {
  const { supervisors, plumbers, staff, rows, filter, setFilter, isLoading } = useProjectTeamTab(projectId, active);

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Project Team" subtitle="People actively working on this project" />

      <CompactStatGrid columns={3}>
        <MetricCard label="Supervisors" value={formatCompactCount(supervisors.length)} icon={UserGearIcon} />
        <MetricCard label="Plumbers" value={formatCompactCount(plumbers.length)} icon={UserGearIcon} />
        <MetricCard label="Staff" value={formatCompactCount(staff.length)} icon={UserGearIcon} />
      </CompactStatGrid>

      <SectionCard title="Team Members">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(
            [
              ["all", "All"],
              ["supervisors", "Supervisors"],
              ["plumbers", "Plumbers"],
              ["staff", "Staff"],
            ] as [TeamFilter, string][]
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "default" : "outline"}
              className="h-7 px-2.5 text-xs"
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        <DataTable
          columns={teamColumns}
          data={rows}
          variant="striped"
          isLoading={isLoading}
          emptyTitle={TEAM_EMPTY_MESSAGES[filter]}
        />
      </SectionCard>
    </div>
  );
}
