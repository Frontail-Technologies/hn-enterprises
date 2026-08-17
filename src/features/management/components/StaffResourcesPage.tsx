"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DownloadSimpleIcon, EyeIcon, NotePencilIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { type ColumnDef } from "@/components/shared/DataTable";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useStaffQuery, useDeleteStaff, useStaffDeleteImpactQuery, useBulkDeleteStaff } from "../hooks/useStaff";
import { useUsersQuery } from "../hooks/useUsers";
import type { Staff } from "../types/staff.types";
import { formatDateTime, uniqOptions } from "../utils/format";
import { StaffDrawer } from "./StaffDrawer";
import { DeleteImpactDialog } from "@/components/shared/DeleteImpactDialog";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

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
    role: "all",
    status: "all",
  });
  const { data: staff = [], isLoading: staffLoading } = useStaffQuery();
  const { data: users = [] } = useUsersQuery();
  const { selectedIds, toggleRow, toggleAllOnPage, clear } = useBulkSelection();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteStaff();

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    setDeleteOpen(false);
    clear();
  }
  const staffedUserIds = useMemo(() => new Set(staff.map((row) => row.userId)), [staff]);
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return staff.filter(
      (row) =>
        (row.role === "Super Admin" || row.role === "Supervisor") &&
        (!search ||
          row.name.toLowerCase().includes(search) ||
          row.contact.toLowerCase().includes(search)) &&
        (filters.role === "all" || row.role === filters.role) &&
        (filters.status === "all" || row.status === filters.status),
    );
  }, [staff, filters]);
  const columns: ColumnDef<Staff>[] = [
    { key: "name", header: "Name", render: (row) => <b>{row.name}</b> },
    { key: "role", header: "Role" },
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
          <ActionTooltip label="View staff">
            <Link
              href={`/staff/${row.id}`}
              aria-label={`View ${row.name}`}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Edit staff">
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
      title="Staff & Resources"
      subtitle="Manage employees, supervisors and field executives — payroll details linked to their real login."
      actions={
        <>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={() => void exportRowsToExcel("staff.xlsx", exportColumns, data)}
          >
            <DownloadSimpleIcon size={15} />
            Export Excel
          </button>
          <StaffDrawer users={users} staffedUserIds={staffedUserIds} />
        </>
      }
    >
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search staff or mobile..."
        title="Staff Filters"
        values={filters}
        filters={[
          {
            key: "role",
            placeholder: "All Roles",
            options: uniqOptions(staff.map((row) => row.role)),
          },
          {
            key: "status",
            placeholder: "All Statuses",
            options: uniqOptions(staff.map((row) => row.status)),
          },
        ]}
        onChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
        onReset={() => setFilters({ search: "", role: "all", status: "all" })}
      />
      <BulkDeleteBar selectedCount={selectedIds.size} onClear={clear} onDelete={() => setDeleteOpen(true)} />
      <PaginatedDataTable
        data={data}
        columns={columns}
        isLoading={staffLoading}
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
        entityLabel="Staff Member"
        entityLabelPlural="Staff Members"
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        note="This deactivates the linked login, matching the existing single-record delete - it does not erase the staff record."
      />
    </PageShell>
  );
}

// Staff deletion never hard-deletes (it only deactivates the linked login), so
// this is never blocked - the impact preview here is purely informational
// (shows linked attendance history that will be preserved).
function StaffDeleteAction({ staff }: { staff: Staff }) {
  const [open, setOpen] = useState(false);
  const deleteStaff = useDeleteStaff();
  const deleteImpact = useStaffDeleteImpactQuery(staff.id, { enabled: open });

  return (
    <DeleteImpactDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Delete ${staff.name}`}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <TrashIcon size={13} />
        </Button>
      }
      entityTypeLabel="Staff Member"
      impact={deleteImpact.data}
      isLoading={deleteImpact.isLoading}
      isError={deleteImpact.isError}
      onRetry={() => void deleteImpact.refetch()}
      isConfirming={deleteStaff.isPending}
      onConfirm={async () => {
        await deleteStaff.mutateAsync(staff.id);
        setOpen(false);
      }}
    />
  );
}
