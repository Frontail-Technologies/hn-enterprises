"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DownloadSimpleIcon, EyeIcon, NotePencilIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { DeleteImpactAction } from "@/components/shared/DeleteImpactAction";
import { ListTable, useClientRows, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useStaffQuery } from "../hooks/useStaff";
import { useBulkDeleteUsers, useDeleteUser, useUserDeleteImpactQuery, useUsersQuery } from "../hooks/useUsers";
import type { Staff } from "../types/staff.types";
import { formatDateTime, uniqOptions } from "../utils/format";
import { StaffDrawer } from "./StaffDrawer";
import { UserAvatar } from "@/components/shared/UserAvatar";

const exportColumns: ExportColumn<Staff>[] = [
  { label: "Name", getValue: (row) => row.name },
  { label: "Role", getValue: (row) => row.role },
  { label: "Contact", getValue: (row) => row.contact },
  { label: "Status", getValue: (row) => row.status },
  { label: "Last Login", getValue: (row) => (row.lastLogin ? formatDateTime(row.lastLogin) : "Never") },
];

const columns: ListColumn<Staff>[] = [
  {
    id: "name",
    header: "Name",
    value: (row) => row.name,
    isTitle: true,
    hideable: false,
    sortable: true,
    width: 240,
    grow: true,
    cell: (row) => (
      <span className="flex items-center gap-2.5">
        <UserAvatar name={row.name} src={row.avatarUrl} size="xs" />
        <span className="truncate">{row.name}</span>
      </span>
    ),
  },
  { id: "contact", header: "Contact", value: (row) => row.contact, sortable: true, width: 180 },
  { id: "status", header: "Status", value: (row) => row.status, sortable: true, width: 130, cell: (row) => <StatusBadge status={row.status} /> },
  {
    id: "lastLogin",
    header: "Last login",
    value: (row) => row.lastLogin ?? "",
    sortable: true,
    width: 180,
    cell: (row) => (row.lastLogin ? formatDateTime(row.lastLogin) : <span className="text-muted-foreground">Never</span>),
  },
];

const searchText = (row: Staff) => `${row.name} ${row.contact}`;

export function StaffResourcesPage() {
  const list = useListState({ pageSize: 50, storageKey: "supervisors" });
  const { data: staff = [], isLoading: staffLoading, isError, refetch } = useStaffQuery();
  const { data: users = [] } = useUsersQuery();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteUsers();

  const supervisors = useMemo(() => staff.filter((row) => row.role === "Supervisor"), [staff]);
  const filters: ListFilter[] = [{ id: "status", label: "Status", quick: true, options: uniqOptions(staff.map((row) => row.status)) }];
  const { rows: filteredRows, pageRows, total } = useClientRows(supervisors, list, { columns, filters, searchText });

  // Selection is keyed by staff.id (the table's row identity); the canonical
  // delete workflow operates on the linked user id (remove-staff-block brief §8).
  const userIdByStaffId = useMemo(() => new Map(staff.map((row) => [row.id, row.userId])), [staff]);
  const staffedUserIds = useMemo(() => new Set(staff.map((row) => row.userId)), [staff]);

  async function handleBulkDelete() {
    const userIds = Array.from(list.selection)
      .map((staffId) => userIdByStaffId.get(staffId))
      .filter((id): id is string => Boolean(id));
    await bulkDelete.mutateAsync(userIds);
    setDeleteOpen(false);
    list.clearSelection();
  }

  return (
    <PageShell
      title="Supervisors"
      description="Supervisor accounts, their contact details and last login."
      actions={<StaffDrawer users={users} staffedUserIds={staffedUserIds} />}
    >
      <ListTable
        itemLabel="supervisor"
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        filters={filters}
        searchPlaceholder="Search supervisors or mobile..."
        isLoading={staffLoading}
        isError={isError}
        onRetry={() => void refetch()}
        enableFullView
        selectable
        getRowLabel={(row) => row.name}
        bulkActions={() => (
          <Button type="button" variant="ghost" size="compact" onClick={() => setDeleteOpen(true)}>
            <TrashIcon size={14} />
            Delete
          </Button>
        )}
        empty={{ illustration: "customers", title: "No supervisors yet", description: "Supervisors you add will appear here." }}
        actions={
          <Button type="button" variant="outline" size="compact" onClick={() => void exportRowsToExcel("supervisors.xlsx", exportColumns, filteredRows)}>
            <DownloadSimpleIcon size={14} />
            Export
          </Button>
        }
        rowActionsWidth={112}
        renderRowActions={(row) => (
          <div className="flex items-center gap-0.5">
            <ActionTooltip label="View supervisor">
              <Link href={`/staff/${row.id}`} aria-label={`View ${row.name}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                <EyeIcon size={15} />
              </Link>
            </ActionTooltip>
            <ActionTooltip label="Edit supervisor">
              <Link href={`/staff/${row.id}/edit`} aria-label={`Edit ${row.name}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                <NotePencilIcon size={15} />
              </Link>
            </ActionTooltip>
            <StaffDeleteAction staff={row} />
          </div>
        )}
      />

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={list.selection.size}
        entityLabel="Supervisor"
        entityLabelPlural="Supervisors"
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        note="This permanently removes each account and its current staff profile, and clears any active site assignments. Historical activity, audit records and payroll/business history are preserved."
      />
    </PageShell>
  );
}

function StaffDeleteAction({ staff }: { staff: Staff }) {
  const [open, setOpen] = useState(false);
  // Canonical user hard-delete workflow, keyed by the linked user id - the
  // same one Users & Roles uses (remove-staff-block brief §8). There is no
  // staff-scoped delete anymore: deleting here permanently removes the
  // account, and the current staff profile goes with it automatically
  // (staff.userId is ON DELETE CASCADE).
  const deleteUser = useDeleteUser();
  const deleteImpact = useUserDeleteImpactQuery(staff.userId, { enabled: open });

  const activeAssignments = deleteImpact.data?.dependencies.find((d) => d.key === "activeSiteAssignments");
  const note = activeAssignments && activeAssignments.count > 0
    ? `This will remove the user account, remove the current staff profile, and release the email/mobile/login identifiers for reuse. Historical activity, audit records and payroll/business history will be preserved. This supervisor's ${activeAssignments.count} active site assignment${activeAssignments.count === 1 ? "" : "s"} will become Unassigned.`
    : "This will remove the user account, remove the current staff profile, and release the email/mobile/login identifiers for reuse. Historical activity, audit records and payroll/business history will be preserved.";

  return (
    <DeleteImpactAction
      open={open}
      onOpenChange={setOpen}
      itemName={staff.name}
      entityTypeLabel="Supervisor"
      note={note}
      confirmLabel="Delete Permanently"
      impact={deleteImpact.data}
      isImpactLoading={deleteImpact.isLoading}
      isImpactError={deleteImpact.isError}
      onRetryImpact={() => void deleteImpact.refetch()}
      isDeleting={deleteUser.isPending}
      onDelete={() => deleteUser.mutateAsync(staff.userId)}
    />
  );
}
