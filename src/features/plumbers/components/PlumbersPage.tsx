"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, MagnifyingGlassIcon, NotePencilIcon, PlusIcon, UploadSimpleIcon, WrenchIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ColumnDef } from "@/components/shared/DataTable";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { DeleteImpactAction } from "@/components/shared/DeleteImpactAction";
import { FilterDialog } from "@/components/shared/FilterDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageShell } from "@/components/shared/PageShell";
import { PaginatedDataTable } from "@/components/shared/PaginatedDataTable";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import {
  useBulkDeletePlumbers,
  useDeletePlumber,
  usePlumberDeleteImpactQuery,
  usePlumbersQuery,
  useUpdatePlumber,
} from "../hooks/usePlumbers";
import { PlumberDialog } from "./PlumberDialog";
import type { Plumber } from "../types/plumber.types";

const exportColumns: ExportColumn<Plumber>[] = [
  { label: "Name", getValue: (row) => row.name },
  { label: "Type", getValue: (row) => (row.type === "team" ? "Team" : "Individual") },
  { label: "Contact Number", getValue: (row) => row.contactNumber },
  { label: "Status", getValue: (row) => (row.status === "active" ? "Active" : "Inactive") },
  { label: "Remarks", getValue: (row) => row.remarks },
];

export function PlumbersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({ search: "", type: "all", status: "all" });
  const { data: plumbers = [] } = usePlumbersQuery(filters.search || undefined);
  const [drawerState, setDrawerState] = useState<{ open: boolean; plumber?: Plumber }>({ open: false });
  const { selectedIds, toggleRow, toggleAllOnPage, clear } = useBulkSelection();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeletePlumbers();

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    setDeleteOpen(false);
    clear();
  }

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
          <PlumberDeleteAction plumber={row} />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Plumbers"
      icon={WrenchIcon}
      actions={
        <>
          <div className="relative min-w-0 sm:w-52">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
            <Input
              placeholder="Search plumbers..."
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="h-8 w-full max-w-full pl-8 sm:w-52"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:contents">
            <FilterDialog
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
              onReset={() => setFilters((current) => ({ ...current, type: "all", status: "all" }))}
            />

            <Button type="button" variant="outline" size="compact" onClick={() => void exportRowsToExcel("plumbers.xlsx", exportColumns, filteredPlumbers)}>
              <DownloadSimpleIcon size={12} />
              Export
            </Button>

            <Button type="button" variant="outline" size="compact" onClick={() => router.push("/plumbers/import")}>
              <UploadSimpleIcon size={12} />
              Import
            </Button>
          </div>

          <Button type="button" size="compact" onClick={() => setDrawerState({ open: true })}>
            <PlusIcon size={13} />
            Add Plumber
          </Button>
        </>
      }
      contentClassName="space-y-3"
    >
      <BulkDeleteBar selectedCount={selectedIds.size} onClear={clear} onDelete={() => setDeleteOpen(true)} />
      <PaginatedDataTable
        data={filteredPlumbers}
        columns={columns}
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
        entityLabel="Plumber"
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        note="Plumbers with associated records (e.g. wage records) will be skipped with an error instead of partially deleted."
      />

      <PlumberDialog
        key={drawerState.plumber?.id ?? "new"}
        open={drawerState.open}
        onOpenChange={(open) => setDrawerState((current) => ({ ...current, open }))}
        plumber={drawerState.plumber}
      />
    </PageShell>
  );
}

function PlumberDeleteAction({ plumber }: { plumber: Plumber }) {
  const [open, setOpen] = useState(false);
  const deletePlumber = useDeletePlumber();
  const deactivatePlumber = useUpdatePlumber(plumber.id);
  const deleteImpact = usePlumberDeleteImpactQuery(plumber.id, { enabled: open });

  return (
    <DeleteImpactAction
      open={open}
      onOpenChange={setOpen}
      itemName={plumber.name}
      entityTypeLabel="Plumber"
      impact={deleteImpact.data}
      isImpactLoading={deleteImpact.isLoading}
      isImpactError={deleteImpact.isError}
      onRetryImpact={() => void deleteImpact.refetch()}
      isDeleting={deletePlumber.isPending}
      onDelete={() => deletePlumber.mutateAsync(plumber.id)}
      isDeactivating={deactivatePlumber.isPending}
      deactivateLabel="Deactivate Plumber"
      onDeactivate={() =>
        deactivatePlumber.mutateAsync({
          name: plumber.name,
          type: plumber.type,
          contactNumber: plumber.contactNumber,
          status: "inactive",
          remarks: plumber.remarks,
        })
      }
    />
  );
}
