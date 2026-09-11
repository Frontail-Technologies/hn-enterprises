import { useMemo, useState } from "react";
import { useProjectTeamQuery } from "@/features/projects/hooks/useProjects";
import type { ProjectTeam } from "../../../types/project.types";
import { buildTeamRows, type TeamFilter, type TeamRow } from "../../../model/team-roster.model";

const EMPTY_SUPERVISORS: ProjectTeam["supervisors"] = [];
const EMPTY_PLUMBERS: ProjectTeam["plumbers"] = [];
const EMPTY_STAFF: ProjectTeam["staff"] = [];

export function useProjectTeamTab(projectId: string, active: boolean) {
  const { data: team, isLoading } = useProjectTeamQuery(projectId, { enabled: active });
  const [filter, setFilter] = useState<TeamFilter>("all");

  const supervisors = team?.supervisors ?? EMPTY_SUPERVISORS;
  const plumbers = team?.plumbers ?? EMPTY_PLUMBERS;
  const staff = team?.staff ?? EMPTY_STAFF;

  const rows: TeamRow[] = useMemo(
    () => buildTeamRows(supervisors, plumbers, staff, filter),
    [supervisors, plumbers, staff, filter],
  );

  return { supervisors, plumbers, staff, rows, filter, setFilter, isLoading };
}
