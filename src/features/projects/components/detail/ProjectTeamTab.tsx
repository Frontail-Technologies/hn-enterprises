"use client";

import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { useProjectTeamQuery } from "@/features/projects/hooks/useProjects";
import type { ProjectTeamPlumber, ProjectTeamStaffMember, ProjectTeamSupervisor } from "../../types/project.types";
import { formatDateTime, toTitleCase } from "./project-detail.utils";

type Person = ProjectTeamSupervisor | ProjectTeamPlumber;

function PersonCell({ person }: { person: Person }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <UserAvatar name={person.name} src={person.avatarUrl} size="sm" />
      <span className="truncate font-medium">{person.name}</span>
      {person.linked === false ? (
        <Badge variant="outline" className="shrink-0 text-[11px] text-muted-foreground" title="Only a name in the imported sheet - not linked to a saved record">
          Name only
        </Badge>
      ) : null}
    </span>
  );
}

const siteNames = (person: Person) => person.sites.map((site) => site.name).join(", ") || "-";
const lastActive = (person: Person) => (person.lastActivityAt ? formatDateTime(person.lastActivityAt) : "-");

const supervisorColumns: ListColumn<ProjectTeamSupervisor>[] = [
  { id: "name", header: "Supervisor", value: (row) => row.name, cell: (row) => <PersonCell person={row} />, isTitle: true, hideable: false, sortable: true, width: 260, grow: true },
  { id: "sites", header: "Sites / areas", value: siteNames, sortable: true, width: 260 },
  { id: "lastActivityAt", header: "Last update", value: lastActive, sortable: true, width: 170 },
];

const plumberColumns: ListColumn<ProjectTeamPlumber>[] = [
  { id: "name", header: "Plumber", value: (row) => row.name, cell: (row) => <PersonCell person={row} />, isTitle: true, hideable: false, sortable: true, width: 260, grow: true },
  { id: "customerCount", header: "Customers", value: (row) => row.customerCount, align: "end", sortable: true, width: 120 },
  { id: "sites", header: "Sites / areas", value: siteNames, sortable: true, width: 240 },
  { id: "lastActivityAt", header: "Last material issue", value: lastActive, sortable: true, width: 180 },
];

const staffColumns: ListColumn<ProjectTeamStaffMember>[] = [
  { id: "name", header: "Name", value: (row) => row.name, isTitle: true, hideable: false, sortable: true, width: 240, grow: true },
  { id: "designation", header: "Role", value: (row) => toTitleCase(row.designation.replace(/_/g, " ")), sortable: true, width: 180 },
];

/** Everyone working on the project: supervisors, plumbers (with their customers) and staff. */
export function ProjectTeamTab({ projectId }: { projectId: string }) {
  const { data: team, isLoading, isError, refetch } = useProjectTeamQuery(projectId);
  const supervisorList = useListState({ pageSize: 25, storageKey: "project-team-supervisors" });
  const plumberList = useListState({ pageSize: 25, storageKey: "project-team-plumbers" });
  const staffList = useListState({ pageSize: 25, storageKey: "project-team-staff" });
  const supervisors = useClientRows(team?.supervisors ?? [], supervisorList, { columns: supervisorColumns });
  const plumbers = useClientRows(team?.plumbers ?? [], plumberList, { columns: plumberColumns });
  const staff = useClientRows(team?.staff ?? [], staffList, { columns: staffColumns });

  const section = (title: string, hint: string, table: React.ReactNode) => (
    <section className="flex flex-col gap-2">
      <div>
        <h2 className="text-section-title">{title}</h2>
      </div>
      {table}
    </section>
  );

  return (
    <div className="flex flex-col gap-6">
      {section(
        "Supervisors",
        "Assigned to the project or to one of its sites.",
        <ListTable
          itemLabel="supervisor"
          rows={supervisors.pageRows}
          total={supervisors.total}
          columns={supervisorColumns}
          state={supervisorList}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          searchPlaceholder="Search supervisors or sites..."
          empty={{ illustration: "customers", title: "No supervisors on this project yet." }}
        />,
      )}
      {section(
        "Plumbers",
        "Everyone recorded as the plumber on this project's customers, busiest first.",
        <ListTable
          itemLabel="plumber"
          rows={plumbers.pageRows}
          total={plumbers.total}
          columns={plumberColumns}
          state={plumberList}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          searchPlaceholder="Search plumbers or sites..."
          empty={{ illustration: "customers", title: "No plumbers recorded on this project's customers yet." }}
        />,
      )}
      {section(
        "Staff",
        "Other staff assigned to this project.",
        <ListTable
          itemLabel="staff member"
          rows={staff.pageRows}
          total={staff.total}
          columns={staffColumns}
          state={staffList}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          searchPlaceholder="Search staff..."
          empty={{ illustration: "customers", title: "No staff assigned to this project." }}
        />,
      )}
    </div>
  );
}
