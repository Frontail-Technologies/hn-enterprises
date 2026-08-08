"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DownloadSimpleIcon, EyeIcon, NotePencilIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useStaffQuery, useDeleteStaff } from "../hooks/useStaff";
import { useUsersQuery } from "../hooks/useUsers";
import type { Staff } from "../types/staff.types";
import { formatDateTime, uniqOptions } from "../utils/format";
import { StaffDrawer } from "./StaffDrawer";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
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
  const deleteStaff = useDeleteStaff();
  const { data: users = [] } = useUsersQuery();
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
          <DeleteConfirmDialog
            itemName={row.name}
            onConfirm={() => deleteStaff.mutateAsync(row.id)}
          />
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
      <PaginatedDataTable data={data} columns={columns} isLoading={staffLoading} />
    </PageShell>
  );
}
