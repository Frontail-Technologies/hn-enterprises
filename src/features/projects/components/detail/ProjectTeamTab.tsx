"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlassIcon, PlusIcon, UserMinusIcon } from "@phosphor-icons/react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRosterQuery } from "@/features/management/hooks/useAttendance";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useProjectTeamQuery } from "@/features/projects/hooks/useProjects";
import { useAddProjectMembers, useProjectMembersQuery, useRemoveProjectMember } from "@/features/projects/hooks/useProjectMembers";
import type { ProjectMember } from "@/features/projects/services/project-members.service";
import type { ProjectTeamStaffMember } from "../../types/project.types";
import { formatDate, formatDateTime, toTitleCase } from "./project-detail.utils";

type Kind = ProjectMember["kind"];
type MemberRow = ProjectMember & { sites: string; customers: number; lastActivityAt: string | null };

const KIND_LABEL: Record<Kind, { one: string; many: string }> = {
  supervisor: { one: "Supervisor / Manager", many: "Supervisors & Managers" },
  plumber: { one: "Plumber", many: "Plumbers" },
  labour: { one: "Labour", many: "Labour" },
};

function PersonCell({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <UserAvatar name={name} src={avatarUrl} size="sm" />
      <span className="truncate font-medium">{name}</span>
    </span>
  );
}

const designationLabel = (value: string | null) =>
  value ? value.replace(/_/g, " ").replace(/\w/g, (letter) => letter.toUpperCase()) : "Supervisor";

function memberColumns(kind: Kind): ListColumn<MemberRow>[] {
  return [
    { id: "name", header: KIND_LABEL[kind].one, value: (row) => row.name, cell: (row) => <PersonCell name={row.name} avatarUrl={row.avatarUrl} />, isTitle: true, hideable: false, sortable: true, width: 240, grow: true },
    ...(kind === "supervisor"
      ? [{ id: "designation", header: "Designation", value: (row: MemberRow) => designationLabel(row.designation), sortable: true, width: 150 }]
      : []),
    { id: "mobile", header: "Mobile", value: (row) => row.mobile ?? "-", width: 140 },
    ...(kind === "supervisor"
      ? [{ id: "sites", header: "Sites / areas", value: (row: MemberRow) => row.sites || "-", sortable: true, width: 220 }]
      : [{ id: "customers", header: "Customers", value: (row: MemberRow) => row.customers, align: "end" as const, sortable: true, width: 110 }]),
    { id: "lastActivityAt", header: "Last activity", value: (row) => (row.lastActivityAt ? formatDateTime(row.lastActivityAt) : "-"), sortable: true, width: 170 },
    { id: "addedAt", header: "Added on", value: (row) => formatDate(row.addedAt), sortable: true, width: 130 },
  ];
}

const historyColumns: ListColumn<ProjectMember>[] = [
  { id: "name", header: "Name", value: (row) => row.name, cell: (row) => <PersonCell name={row.name} avatarUrl={row.avatarUrl} />, isTitle: true, hideable: false, sortable: true, width: 230, grow: true },
  { id: "kind", header: "Role", value: (row) => KIND_LABEL[row.kind].one, sortable: true, width: 120 },
  { id: "addedAt", header: "Added on", value: (row) => formatDate(row.addedAt), sortable: true, width: 130 },
  { id: "removedAt", header: "Removed on", value: (row) => (row.removedAt ? formatDate(row.removedAt) : "-"), sortable: true, width: 130 },
  { id: "removedByName", header: "Removed by", value: (row) => row.removedByName ?? "-", sortable: true, width: 160 },
];

const staffColumns: ListColumn<ProjectTeamStaffMember>[] = [
  { id: "name", header: "Name", value: (row) => row.name, isTitle: true, hideable: false, sortable: true, width: 240, grow: true },
  { id: "designation", header: "Role", value: (row) => toTitleCase(row.designation.replace(/_/g, " ")), sortable: true, width: 180 },
];

/**
 * Who works on the project. Supervisors only see the projects they are on in
 * the mobile app, and can only pick the plumbers/labour on those projects.
 * Removing someone keeps them in "Former members" (history).
 */
export function ProjectTeamTab({ projectId }: { projectId: string }) {
  const { data: members = [], isLoading, isError, refetch } = useProjectMembersQuery(projectId);
  const { data: team } = useProjectTeamQuery(projectId);
  const historyList = useListState({ pageSize: 25, storageKey: "project-team-history" });
  const staffList = useListState({ pageSize: 25, storageKey: "project-team-staff" });

  const current = members.filter((member) => !member.removedAt);
  const former = members.filter((member) => member.removedAt);
  const history = useClientRows(former, historyList, { columns: historyColumns });
  const staff = useClientRows(team?.staff ?? [], staffList, { columns: staffColumns });

  // Extra facts (sites, customers, last activity) from the team summary.
  const facts = useMemo(() => {
    const map = new Map<string, { sites: string; customers: number; lastActivityAt: string | null }>();
    for (const person of [...(team?.supervisors ?? []), ...(team?.plumbers ?? [])]) {
      map.set(person.id, { sites: person.sites.map((site) => site.name).join(", "), customers: person.customerCount, lastActivityAt: person.lastActivityAt });
    }
    return map;
  }, [team]);
  const rowsOf = (kind: Kind): MemberRow[] =>
    current.filter((member) => member.kind === kind).map((member) => ({ ...member, ...(facts.get(member.personId) ?? { sites: "", customers: 0, lastActivityAt: null }) }));

  const unlinked = (team?.plumbers ?? []).filter((person) => person.linked === false).map((person) => person.name);
  const unlinkedSupervisors = (team?.supervisors ?? []).filter((person) => person.linked === false).map((person) => person.name);

  return (
    <div className="flex flex-col gap-6">
      {(["supervisor", "plumber", "labour"] as const).map((kind) => (
        <MemberSection
          key={kind}
          kind={kind}
          projectId={projectId}
          rows={rowsOf(kind)}
          currentIds={new Set(current.filter((member) => member.kind === kind).map((member) => member.personId))}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          note={
            kind === "supervisor" && unlinkedSupervisors.length
              ? `In the imported sheet but not linked to a supervisor account: ${unlinkedSupervisors.join(", ")}`
              : kind === "plumber" && unlinked.length
                ? `In the imported sheet but not linked to a saved plumber: ${unlinked.join(", ")}`
                : undefined
          }
        />
      ))}

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title">Former members</h2>
        <ListTable
          itemLabel="former member"
          rows={history.pageRows}
          total={history.total}
          columns={historyColumns}
          state={historyList}
          isLoading={isLoading}
          searchPlaceholder="Search former members..."
          empty={{ illustration: "records", title: "Nobody has been removed from this project." }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title">Other staff</h2>
        <ListTable
          itemLabel="staff member"
          rows={staff.pageRows}
          total={staff.total}
          columns={staffColumns}
          state={staffList}
          searchPlaceholder="Search staff..."
          empty={{ illustration: "customers", title: "No other staff assigned to this project." }}
        />
      </section>
    </div>
  );
}

function MemberSection({
  kind,
  projectId,
  rows,
  currentIds,
  isLoading,
  isError,
  onRetry,
  note,
}: {
  kind: Kind;
  projectId: string;
  rows: MemberRow[];
  currentIds: Set<string>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  note?: string;
}) {
  const list = useListState({ pageSize: 25, storageKey: `project-team-${kind}` });
  const columns = useMemo(() => memberColumns(kind), [kind]);
  const table = useClientRows(rows, list, { columns });
  const remove = useRemoveProjectMember(projectId);
  const [adding, setAdding] = useState(false);
  const label = KIND_LABEL[kind];

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-section-title">
          {label.many} <span className="font-normal text-muted-foreground tabular-nums">{rows.length}</span>
        </h2>
        <Button type="button" size="compact" variant="outline" onClick={() => setAdding(true)}>
          <PlusIcon size={13} />
          Add {label.one.toLowerCase()}
        </Button>
      </div>
      <ListTable
        itemLabel={label.one.toLowerCase()}
        rows={table.pageRows}
        total={table.total}
        columns={columns}
        state={list}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        searchPlaceholder={`Search ${label.many.toLowerCase()}...`}
        empty={{ illustration: "customers", title: `No ${label.many.toLowerCase()} on this project yet.` }}
        rowActionsWidth={110}
        renderRowActions={(row) => (
          <DeleteConfirmDialog
            itemName={`${row.name} from this project`}
            isConfirming={remove.isPending}
            onConfirm={() => remove.mutateAsync(row.id)}
            trigger={
              <Button type="button" variant="ghost" size="sm" className="gap-1 text-destructive" aria-label={`Remove ${row.name} from the project`}>
                <UserMinusIcon size={14} />
                Remove
              </Button>
            }
          />
        )}
      />
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      {adding ? <AddMembersDialog kind={kind} projectId={projectId} currentIds={currentIds} onClose={() => setAdding(false)} /> : null}
    </section>
  );
}

/** Pick several supervisors / plumbers / labour at once. */
function AddMembersDialog({ kind, projectId, currentIds, onClose }: { kind: Kind; projectId: string; currentIds: Set<string>; onClose: () => void }) {
  const { data: supervisors = [], isLoading: supervisorsLoading } = useRosterQuery("supervisor");
  const { data: roster = [], isLoading: rosterLoading } = usePlumbersQuery();
  const add = useAddProjectMembers(projectId);
  const [search, setSearch] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const label = KIND_LABEL[kind];

  const candidates = useMemo(() => {
    type Candidate = { id: string; name: string; detail?: string | null; avatarUrl?: string | null };
    const people: Candidate[] =
      kind === "supervisor"
        ? supervisors.map((person) => ({ id: person.id, name: person.name, avatarUrl: person.avatarUrl }))
        : roster
            .filter((person) => person.category === kind && person.status === "active")
            .map((person) => ({ id: person.id, name: person.name, detail: person.contactNumber, avatarUrl: person.avatarUrl }));
    const query = search.trim().toLowerCase();
    return people
      .filter((person) => !currentIds.has(person.id))
      .filter((person) => !query || `${person.name} ${person.detail ?? ""}`.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [kind, supervisors, roster, currentIds, search]);
  const loading = kind === "supervisor" ? supervisorsLoading : rosterLoading;

  const toggle = (id: string) => setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  async function save() {
    if (!chosen.length) return;
    await add.mutateAsync(kind === "supervisor" ? { supervisorIds: chosen } : { plumberIds: chosen });
    onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-3">
          <DialogTitle>Add {label.many.toLowerCase()}</DialogTitle>
          <DialogDescription>
            {kind === "supervisor" ? "They will see this project in the mobile app." : "Supervisors on this project can pick them in the mobile app."}
          </DialogDescription>
        </DialogHeader>
        <div className="shrink-0 px-6 pb-2">
          <div className="relative">
            <MagnifyingGlassIcon size={15} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${label.many.toLowerCase()}...`} className="pl-8" autoFocus />
          </div>
        </div>
        <ul className="min-h-24 flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">Loading...</li>
          ) : candidates.length ? (
            candidates.map((person) => (
              <li key={person.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted">
                  <Checkbox checked={chosen.includes(person.id)} onCheckedChange={() => toggle(person.id)} />
                  <UserAvatar name={person.name} src={person.avatarUrl} size="xs" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{person.name}</span>
                  {person.detail ? <span className="shrink-0 text-xs text-muted-foreground">{person.detail}</span> : null}
                </label>
              </li>
            ))
          ) : (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              {search ? "No match." : `Every active ${label.one.toLowerCase()} is already on this project.`}
            </li>
          )}
        </ul>
        <DialogFooter className="flex w-full shrink-0 flex-row items-center justify-between border-t border-border px-6 py-4 sm:justify-between">
          <span className="text-xs text-muted-foreground">{chosen.length ? `${chosen.length} selected` : ""}</span>
          <div className="flex items-center gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="button" disabled={!chosen.length || add.isPending} onClick={() => void save()}>
              {add.isPending ? "Adding..." : `Add ${chosen.length || ""}`.trim()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
