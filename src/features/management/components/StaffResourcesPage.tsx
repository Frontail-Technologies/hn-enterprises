"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DownloadSimpleIcon, EyeIcon, MagnifyingGlassIcon, NotePencilIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { type ColumnDef } from "@/components/shared/DataTable";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { FilterDialog } from "@/components/shared/FilterDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useStaffQuery } from "../hooks/useStaff";
import { useBulkDeleteUsers, useDeleteUser, useUserDeleteImpactQuery, useUsersQuery } from "../hooks/useUsers";
import type { Staff } from "../types/staff.types";
import { formatDateTime, uniqOptions } from "../utils/format";
import { StaffDrawer } from "./StaffDrawer";
import { DeleteImpactAction } from "@/components/shared/DeleteImpactAction";
import { PageShell } from "@/components/shared/PageShell";
import { PaginatedDataTable } from "@/components/shared/PaginatedDataTable";

const exportColumns: ExportColumn<Staff>[] = [
  { label: "Name", getValue: (row) => row.name },
  { label: "Role", getValue: (row) => row.role },
  { label: "Contact", getValue: (row) => row.contact },
  { label: "Status", getValue: (row) => row.status },
  { label: "Last Login", getValue: (row) => (row.lastLogin ? formatDateTime(row.lastLogin) : "Never") },
];

export function StaffResourcesPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });
  const { data: staff = [], isLoading: staffLoading } = useStaffQuery();
  const { data: users = [] } = useUsersQuery();
  const { selectedIds, toggleRow, toggleAllOnPage, clear } = useBulkSelection();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteUsers();
  // Selection is keyed by staff.id (the table's row identity); the canonical
  // delete workflow operates on the linked user id (remove-staff-block brief §8).
  const userIdByStaffId = useMemo(() => new Map(staff.map((row) => [row.id, row.userId])), [staff]);

  async function handleBulkDelete() {
    const userIds = Array.from(selectedIds)
      .map((staffId) => userIdByStaffId.get(staffId))
      .filter((id): id is string => Boolean(id));
    await bulkDelete.mutateAsync(userIds);
    setDeleteOpen(false);
    clear();
  }
  const staffedUserIds = useMemo(() => new Set(staff.map((row) => row.userId)), [staff]);
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return staff.filter(
      (row) =>
        row.role === "Supervisor" &&
        (!search ||
          row.name.toLowerCase().includes(search) ||
          row.contact.toLowerCase().includes(search)) &&
        (filters.status === "all" || row.status === filters.status),
    );
  }, [staff, filters]);
  const columns: ColumnDef<Staff>[] = [
    { key: "name", header: "Name", render: (row) => <b>{row.name}</b> },
    { key: "contact", header: "Contact" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "lastLogin",
      header: "Last Login",
      render: (row) => (row.lastLogin ? formatDateTime(row.lastLogin) : "Never"),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="View supervisor">
            <Link
              href={`/staff/${row.id}`}
              aria-label={`View ${row.name}`}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Edit supervisor">
            <Link
              href={`/staff/${row.id}/edit`}
              aria-label={`Edit ${row.name}`}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <NotePencilIcon size={15} />
            </Link>
          </ActionTooltip>
          <StaffDeleteAction staff={row} />
        </div>
      ),
    },
  ];
  return (
    <PageShell
      title="Supervisors"
      icon={UsersThreeIcon}
      actions={
        <>
          <div className="relative min-w-0 sm:w-64">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
            <Input
              placeholder="Search supervisors or mobile..."
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="h-8 w-full max-w-full pl-8 sm:w-64"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:contents">
            <FilterDialog
              title="Supervisor Filters"
              values={filters}
              filters={[
                {
                  key: "status",
                  placeholder: "All Statuses",
                  options: uniqOptions(staff.map((row) => row.status)),
                },
              ]}
              onChange={(key, value) =>
                setFilters((current) => ({ ...current, [key]: value }))
              }
              onReset={() => setFilters((current) => ({ ...current, status: "all" }))}
            />
            <Button
              type="button"
              variant="outline"
              size="compact"
              onClick={() => void exportRowsToExcel("supervisors.xlsx", exportColumns, data)}
            >
              <DownloadSimpleIcon size={12} />
              Export
            </Button>
          </div>
          <StaffDrawer users={users} staffedUserIds={staffedUserIds} />
        </>
      }
      contentClassName="space-y-3"
    >
      <BulkDeleteBar selectedCount={selectedIds.size} onClear={clear} onDelete={() => setDeleteOpen(true)} />
      <PaginatedDataTable
        data={data}
        columns={columns}
        isLoading={staffLoading}
        enableFullView
        selection={{
          selectedIds,
          onToggleRow: toggleRow,
          onTogglePage: toggleAllOnPage,
          getRowLabel: (row) => row.name,
        }}
      />

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={selectedIds.size}
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
