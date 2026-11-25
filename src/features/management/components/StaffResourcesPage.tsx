"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DownloadSimpleIcon, EyeIcon, NotePencilIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { DeleteImpactAction } from "@/components/shared/DeleteImpactAction";
import { ListTable, useClientRows, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { toast } from "sonner";
import { useBulkDeleteStaff, useDeleteStaff, useStaffQuery } from "../hooks/useStaff";
import { useBulkDeleteUsers, useDeleteUser, useUserDeleteImpactQuery, useUsersQuery } from "../hooks/useUsers";
import { STAFF_DESIGNATIONS, type Staff } from "../types/staff.types";
import { formatDateTime, uniqOptions } from "../utils/format";
import { StaffDrawer } from "./StaffDrawer";
import { UserAvatar } from "@/components/shared/UserAvatar";

const exportColumns: ExportColumn<Staff>[] = [
  { label: "Name", getValue: (row) => row.name },
  { label: "Designation", getValue: (row) => row.designation },
  { label: "Contact", getValue: (row) => row.contact },
  { label: "Status", getValue: (row) => row.status },
  { label: "Last Login", getValue: (row) => (row.hasLogin ? (row.lastLogin ? formatDateTime(row.lastLogin) : "Never") : "No app access") },
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
  { id: "designation", header: "Designation", value: (row) => row.designation, sortable: true, width: 160 },
  { id: "contact", header: "Contact", value: (row) => row.contact, sortable: true, width: 180 },
  { id: "status", header: "Status", value: (row) => row.status, sortable: true, width: 130, cell: (row) => <StatusBadge status={row.status} /> },
  {
    id: "lastLogin",
    header: "Last login",
    value: (row) => row.lastLogin ?? "",
    sortable: true,
    width: 180,
    cell: (row) =>
      !row.hasLogin ? (
        <span className="text-muted-foreground">No app access</span>
      ) : row.lastLogin ? (
        formatDateTime(row.lastLogin)
      ) : (
        <span className="text-muted-foreground">Never</span>
      ),
  },
];

const searchText = (row: Staff) => `${row.name} ${row.contact}`;

export function StaffResourcesPage() {
  const list = useListState({ pageSize: 50, storageKey: "staff" });
  const { data: staff = [], isLoading: staffLoading, isError, refetch } = useStaffQuery();
  const { data: users = [] } = useUsersQuery();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteUsers();
  const bulkDeleteStaff = useBulkDeleteStaff();

  // Supervisors (login accounts) plus everyone without a login.
  const members = useMemo(() => staff.filter((row) => !row.hasLogin || row.role === "Supervisor"), [staff]);
  const filters: ListFilter[] = [
    {
      id: "designation",
      label: "Designation",
      quick: true,
      options: STAFF_DESIGNATIONS.filter((item) => members.some((row) => row.designation === item)).map((item) => ({ value: item, label: item })),
    },
    { id: "status", label: "Status", quick: true, options: uniqOptions(members.map((row) => row.status)) },
  ];
  const { rows: filteredRows, pageRows, total } = useClientRows(members, list, { columns, filters, searchText });

  // Selection is keyed by staff.id (the table's row identity); the canonical
  // delete workflow operates on the linked user id (remove-staff-block brief §8).
  const userIdByStaffId = useMemo(() => new Map(staff.map((row) => [row.id, row.userId])), [staff]);
  const staffedUserIds = useMemo(() => new Set(staff.flatMap((row) => (row.userId ? [row.userId] : []))), [staff]);

  async function handleBulkDelete() {
    const selected = Array.from(list.selection);
    // Supervisors go with their login account; the rest are plain staff records.
    const userIds = selected.map((staffId) => userIdByStaffId.get(staffId)).filter((id): id is string => Boolean(id));
    const plainIds = selected.filter((staffId) => !userIdByStaffId.get(staffId));
    if (userIds.length) await bulkDelete.mutateAsync(userIds);
    if (plainIds.length) {
      const result = await bulkDeleteStaff.mutateAsync(plainIds);
      if (!userIds.length) toast.success(`${result.count} staff member${result.count === 1 ? "" : "s"} deleted`);
    }
    setDeleteOpen(false);
    list.clearSelection();
  }

  return (
    <PageShell
      title="Staff"
      description="Supervisors, site managers, drivers, jointers, helpers and other staff. Only supervisors use the mobile app."
      actions={<StaffDrawer users={users} staffedUserIds={staffedUserIds} />}
    >
      <ListTable
        itemLabel="staff member"
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        filters={filters}
        searchPlaceholder="Search staff or mobile..."
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
        empty={{ illustration: "customers", title: "No staff yet", description: "Staff you add will appear here." }}
        actions={
          <Button type="button" variant="outline" size="compact" onClick={() => void exportRowsToExcel("staff.xlsx", exportColumns, filteredRows)}>
            <DownloadSimpleIcon size={14} />
            Export
          </Button>
        }
        rowActionsWidth={112}
        renderRowActions={(row) => (
          <div className="flex items-center gap-0.5">
            <ActionTooltip label="View">
              <Link href={`/staff/${row.id}`} aria-label={`View ${row.name}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                <EyeIcon size={15} />
              </Link>
            </ActionTooltip>
            <ActionTooltip label="Edit">
              <Link href={`/staff/${row.id}/edit`} aria-label={`Edit ${row.name}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                <NotePencilIcon size={15} />
              </Link>
            </ActionTooltip>
            {row.hasLogin ? <StaffDeleteAction staff={row} /> : <PlainStaffDeleteAction staff={row} />}
          </div>
        )}
      />

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={list.selection.size}
        entityLabel="Staff member"
        entityLabelPlural="Staff members"
        isSubmitting={bulkDelete.isPending || bulkDeleteStaff.isPending}
        onConfirm={handleBulkDelete}
        note="Supervisors lose their login account too, and their active site assignments are cleared. Historical activity, audit records and payroll history are kept."
      />
    </PageShell>
  );
}

/** Staff without a login: just the record. */
function PlainStaffDeleteAction({ staff }: { staff: Staff }) {
  const deleteStaff = useDeleteStaff();
  return (
    <DeleteConfirmDialog
      itemName={staff.name}
      isConfirming={deleteStaff.isPending}
      onConfirm={() => deleteStaff.mutateAsync(staff.id)}
      trigger={
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${staff.name}`} className="text-destructive">
          <TrashIcon size={15} />
        </Button>
      }
    />
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
