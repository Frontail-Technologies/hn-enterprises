"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon, NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { type ColumnDef } from "@/components/shared/DataTable";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageShell } from "@/features/management/components/shared/PageShell";
import { PaginatedDataTable } from "@/features/management/components/shared/PaginatedDataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useDeletePlumber, usePlumbersQuery } from "../hooks/usePlumbers";
import { PlumberDrawer } from "./PlumberDrawer";
import type { Plumber } from "../types/plumber.types";

const exportColumns: ExportColumn<Plumber>[] = [
  { label: "Name", getValue: (row) => row.name },
  { label: "Type", getValue: (row) => (row.type === "team" ? "Team" : "Individual") },
  { label: "Contact Number", getValue: (row) => row.contactNumber },
  { label: "Status", getValue: (row) => (row.status === "active" ? "Active" : "Inactive") },
  { label: "Remarks", getValue: (row) => row.remarks },
];

export function PlumbersPage() {
  const [filters, setFilters] = useState({ search: "", type: "all", status: "all" });
  const { data: plumbers = [] } = usePlumbersQuery(filters.search || undefined);
  const deletePlumber = useDeletePlumber();
  const [drawerState, setDrawerState] = useState<{ open: boolean; plumber?: Plumber }>({ open: false });

  const filteredPlumbers = useMemo(
    () =>
      plumbers.filter(
        (plumber) =>
          (filters.type === "all" || plumber.type === filters.type) &&
          (filters.status === "all" || plumber.status === filters.status),
      ),
    [plumbers, filters.type, filters.status],
  );

  const columns: ColumnDef<Plumber>[] = [
    { key: "name", header: "Name", render: (row) => <b>{row.name}</b> },
    {
      key: "type",
      header: "Type",
      render: (row) => (row.type === "team" ? "Team" : "Individual"),
    },
    { key: "contactNumber", header: "Contact Number" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status === "active" ? "Active" : "Inactive"} />,
    },
    { key: "remarks", header: "Remarks" },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDrawerState({ open: true, plumber: row })}
          >
            <NotePencilIcon size={15} />
          </Button>
          <DeleteConfirmDialog
            itemName={row.name}
            onConfirm={() => deletePlumber.mutateAsync(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Plumbers"
      subtitle="Roster of individual plumbers and named teams/crews assigned to customer connections."
      actions={
        <>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={() => void exportRowsToExcel("plumbers.xlsx", exportColumns, filteredPlumbers)}
          >
            <DownloadSimpleIcon size={15} />
            Export Excel
          </button>
          <Button type="button" onClick={() => setDrawerState({ open: true })}>
            <PlusIcon size={15} />
            Add Plumber
          </Button>
        </>
      }
    >
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search plumbers..."
        title="Plumber Filters"
        values={filters}
        filters={[
          {
            key: "type",
            placeholder: "All Types",
            options: [
              { value: "individual", label: "Individual" },
              { value: "team", label: "Team" },
            ],
          },
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({ search: "", type: "all", status: "all" })}
      />
      <PaginatedDataTable data={filteredPlumbers} columns={columns} />

      <PlumberDrawer
        key={drawerState.plumber?.id ?? "new"}
        open={drawerState.open}
        onOpenChange={(open) => setDrawerState((current) => ({ ...current, open }))}
        plumber={drawerState.plumber}
      />
    </PageShell>
  );
}
