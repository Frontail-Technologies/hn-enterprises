"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon, NotePencilIcon, PlusIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { type ColumnDef } from "@/components/shared/DataTable";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { DeleteImpactDialog } from "@/components/shared/DeleteImpactDialog";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { ImportDialog } from "@/components/shared/ImportDialog";
import { type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageShell } from "@/features/management/components/shared/PageShell";
import { PaginatedDataTable } from "@/features/management/components/shared/PaginatedDataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import {
  useBulkDeletePlumbers,
  useDeletePlumber,
  usePlumberDeleteImpactQuery,
  usePlumbersQuery,
  useUpdatePlumber,
} from "../hooks/usePlumbers";
import { usePlumbersImportPreview, usePlumbersImportConfirm } from "../hooks/usePlumbersImport";
import type { PlumberImportRow } from "../services/plumbers-import.service";
import { PlumberDrawer } from "./PlumberDrawer";
import type { Plumber } from "../types/plumber.types";

const exportColumns: ExportColumn<Plumber>[] = [
  { label: "Name", getValue: (row) => row.name },
  { label: "Type", getValue: (row) => (row.type === "team" ? "Team" : "Individual") },
  { label: "Contact Number", getValue: (row) => row.contactNumber },
  { label: "Status", getValue: (row) => (row.status === "active" ? "Active" : "Inactive") },
  { label: "Remarks", getValue: (row) => row.remarks },
];

const importPreviewColumns: ExcelColumn<PlumberImportRow & { id: string }>[] = [
  { key: "name", label: "Name", width: 220, getValue: (r) => r.name },
  { key: "type", label: "Type", width: 130, getValue: (r) => r.type },
  { key: "contactNumber", label: "Contact Number", width: 160, getValue: (r) => r.contactNumber },
  { key: "remarks", label: "Remarks", width: 240, getValue: (r) => r.remarks },
  {
    key: "status",
    label: "Status",
    width: 120,
    getValue: (r) => (r.error ? "invalid" : "valid"),
    render: (r) => <StatusBadge status={r.error ? "Rejected" : "Approved"} />,
  },
  { key: "error", label: "Error", width: 260, getValue: (r) => r.error || "-" },
];

export function PlumbersPage() {
  const [filters, setFilters] = useState({ search: "", type: "all", status: "all" });
  const { data: plumbers = [] } = usePlumbersQuery(filters.search || undefined);
  const [drawerState, setDrawerState] = useState<{ open: boolean; plumber?: Plumber }>({ open: false });
  const importPreview = usePlumbersImportPreview();
  const importConfirm = usePlumbersImportConfirm();
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
          <ImportDialog
            trigger={
              <Button type="button" variant="outline">
                <UploadSimpleIcon size={15} />
                Import
              </Button>
            }
            title="Import Plumbers"
            description="Upload an Excel file to bulk import plumbers."
            templateFileName="plumbers_template.xlsx"
            templateHeaders={["Name", "Type", "Contact Number", "Remarks"]}
            previewColumns={importPreviewColumns}
            isPreviewPending={importPreview.isPending}
            isConfirmPending={importConfirm.isPending}
            entityLabelPlural="Plumbers"
            onPreview={(file) => importPreview.mutateAsync(file)}
            onConfirm={(validRows) => importConfirm.mutateAsync(validRows)}
          />
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
      <BulkDeleteBar selectedCount={selectedIds.size} onClear={clear} onDelete={() => setDeleteOpen(true)} />
      <PaginatedDataTable
        data={filteredPlumbers}
        columns={columns}
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

      <PlumberDrawer
        key={drawerState.plumber?.id ?? "new"}
        open={drawerState.open}
        onOpenChange={(open) => setDrawerState((current) => ({ ...current, open }))}
        plumber={drawerState.plumber}
      />
    </PageShell>
  );
}

// Owns its own dialog-open state so the delete-impact check is only fetched for
// the row actually being deleted, not every row on the page.
function PlumberDeleteAction({ plumber }: { plumber: Plumber }) {
  const [open, setOpen] = useState(false);
  const deletePlumber = useDeletePlumber();
  const deactivatePlumber = useUpdatePlumber(plumber.id);
  const deleteImpact = usePlumberDeleteImpactQuery(plumber.id, { enabled: open });

  return (
    <DeleteImpactDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Delete ${plumber.name}`}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <TrashIcon size={13} />
        </Button>
      }
      entityTypeLabel="Plumber"
      impact={deleteImpact.data}
      isLoading={deleteImpact.isLoading}
      isError={deleteImpact.isError}
      onRetry={() => void deleteImpact.refetch()}
      isConfirming={deletePlumber.isPending}
      onConfirm={async () => {
        await deletePlumber.mutateAsync(plumber.id);
        setOpen(false);
      }}
      isArchiving={deactivatePlumber.isPending}
      archiveLabel="Deactivate Plumber"
      onArchive={async () => {
        await deactivatePlumber.mutateAsync({
          name: plumber.name,
          type: plumber.type,
          contactNumber: plumber.contactNumber,
          status: "inactive",
          remarks: plumber.remarks,
        });
        setOpen(false);
      }}
    />
  );
}
