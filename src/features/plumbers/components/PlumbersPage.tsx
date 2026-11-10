"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, NotePencilIcon, PlusIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { DeleteImpactAction } from "@/components/shared/DeleteImpactAction";
import { ListTable, useClientRows, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
import { UserAvatar } from "@/components/shared/UserAvatar";

const exportColumns: ExportColumn<Plumber>[] = [
  { label: "Name", getValue: (row) => row.name },
  { label: "Type", getValue: (row) => (row.type === "team" ? "Team" : "Individual") },
  { label: "Contact Number", getValue: (row) => row.contactNumber },
  { label: "Status", getValue: (row) => (row.status === "active" ? "Active" : "Inactive") },
  { label: "Remarks", getValue: (row) => row.remarks },
];

const filters: ListFilter[] = [
  { id: "type", label: "Type", quick: true, options: [{ value: "individual", label: "Individual" }, { value: "team", label: "Team" }] },
  { id: "status", label: "Status", quick: true, options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
];

const columns: ListColumn<Plumber>[] = [
  {
    id: "name",
    header: "Name",
    value: (row) => row.name,
    isTitle: true,
    hideable: false,
    sortable: true,
    width: 220,
    cell: (row) => (
      <span className="flex items-center gap-2.5">
        <UserAvatar name={row.name} src={row.avatarUrl} size="xs" />
        <span className="truncate">{row.name}</span>
      </span>
    ),
  },
  { id: "type", header: "Type", value: (row) => row.type, sortable: true, width: 120, cell: (row) => (row.type === "team" ? "Team" : "Individual") },
  { id: "contactNumber", header: "Contact number", value: (row) => row.contactNumber, width: 160 },
  {
    id: "status",
    header: "Status",
    value: (row) => row.status,
    sortable: true,
    width: 120,
    cell: (row) => <StatusBadge status={row.status === "active" ? "Active" : "Inactive"} />,
  },
  { id: "remarks", header: "Remarks", value: (row) => row.remarks, width: 260, grow: true },
];

export function PlumbersPage() {
  const router = useRouter();
  const list = useListState({ pageSize: 50, storageKey: "plumbers" });
  // Search is sent to the API (as before); type/status filters, sort and paging run on the loaded rows.
  const { data: plumbers = [], isLoading, isError, refetch } = usePlumbersQuery(list.debouncedSearch || undefined);
  const { rows: filteredPlumbers, pageRows, total } = useClientRows(plumbers, list, { columns, filters, clientSearch: false });
  const [drawerState, setDrawerState] = useState<{ open: boolean; plumber?: Plumber }>({ open: false });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeletePlumbers();

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(list.selection));
    setDeleteOpen(false);
    list.clearSelection();
  }

  return (
    <PageShell
      title="Plumbers"
      description="Individual plumbers and plumber teams working on sites."
      actions={
        <Button type="button" size="compact" onClick={() => setDrawerState({ open: true })}>
          <PlusIcon size={13} />
          Add Plumber
        </Button>
      }
    >
      <ListTable
        itemLabel="plumber"
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        filters={filters}
        searchPlaceholder="Search plumbers..."
        isLoading={isLoading}
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
        empty={{
          illustration: "customers",
          title: "No plumbers yet",
          description: "Add plumbers one by one or import them from Excel.",
          action: { label: "Add plumber", onClick: () => setDrawerState({ open: true }) },
        }}
        actions={
          <>
            <Button type="button" variant="outline" size="compact" onClick={() => void exportRowsToExcel("plumbers.xlsx", exportColumns, filteredPlumbers)}>
              <DownloadSimpleIcon size={14} />
              Export
            </Button>
            <Button type="button" variant="outline" size="compact" onClick={() => router.push("/plumbers/import")}>
              <UploadSimpleIcon size={14} />
              Import
            </Button>
          </>
        }
        rowActionsWidth={84}
        renderRowActions={(row) => (
          <div className="flex items-center gap-0.5">
            <ActionTooltip label="Edit plumber">
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${row.name}`} onClick={() => setDrawerState({ open: true, plumber: row })}>
                <NotePencilIcon size={15} />
              </Button>
            </ActionTooltip>
            <PlumberDeleteAction plumber={row} />
          </div>
        )}
      />

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={list.selection.size}
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
          // Keep the existing photo (an empty value would remove it).
          avatarUrl: plumber.avatarUrl,
          status: "inactive",
          remarks: plumber.remarks,
        })
      }
    />
  );
}
