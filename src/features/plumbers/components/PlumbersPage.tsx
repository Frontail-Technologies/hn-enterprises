"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScrollableTabsList } from "@/components/shared/ScrollableTabsList";
import { Tabs, TabsTrigger } from "@/components/ui/tabs";
import { formatCompactCount } from "@/lib/format";
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
import type { Plumber, PlumberCategory } from "../types/plumber.types";
import { UserAvatar } from "@/components/shared/UserAvatar";

const exportColumns: ExportColumn<Plumber>[] = [
  { label: "Name", getValue: (row) => row.name },
  { label: "Type", getValue: (row) => (row.type === "team" ? "Team" : "Individual") },
  { label: "Contact Number", getValue: (row) => row.contactNumber },
  { label: "Projects", getValue: (row) => row.projectNames.join(", ") },
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
  { id: "projects", header: "Projects", value: (row) => row.projectNames.join(", ") || "-", sortable: true, width: 240 },
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Plumbers and labour share one roster; the tab is kept in the address (?tab=labour).
  const category: PlumberCategory = searchParams.get("tab") === "labour" ? "labour" : "plumber";
  const isLabour = category === "labour";
  const kind = isLabour ? "Labour" : "Plumber";
  const list = useListState({ pageSize: 50, storageKey: "plumbers" });
  // Search is sent to the API (as before); type/status filters, sort and paging run on the loaded rows.
  const { data: everyone = [], isLoading, isError, refetch } = usePlumbersQuery(list.debouncedSearch || undefined);
  const plumbers = useMemo(() => everyone.filter((row) => row.category === category), [everyone, category]);
  const labourCount = useMemo(() => everyone.filter((row) => row.category === "labour").length, [everyone]);
  const { rows: filteredPlumbers, pageRows, total } = useClientRows(plumbers, list, { columns, filters, clientSearch: false });

  function selectTab(next: PlumberCategory) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "labour") params.set("tab", "labour");
    else params.delete("tab");
    list.clearSelection();
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }
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
      title="Plumbers & Labour"
      description="Plumbers and labour (individuals or teams) working on sites. Only plumbers are set on customers."
      actions={
        <Button type="button" size="compact" onClick={() => setDrawerState({ open: true })}>
          <PlusIcon size={13} />
          Add {kind}
        </Button>
      }
    >
      <Tabs value={category} onValueChange={(value) => value && selectTab(value as PlumberCategory)} className="mb-4">
        <ScrollableTabsList>
          <TabsTrigger value="plumber" className="shrink-0">
            Plumbers
            {!isLoading ? <span className="ms-1 text-muted-foreground tabular-nums">{formatCompactCount(everyone.length - labourCount)}</span> : null}
          </TabsTrigger>
          <TabsTrigger value="labour" className="shrink-0">
            Labour
            {!isLoading ? <span className="ms-1 text-muted-foreground tabular-nums">{formatCompactCount(labourCount)}</span> : null}
          </TabsTrigger>
        </ScrollableTabsList>
      </Tabs>
      <ListTable
        itemLabel={isLabour ? "labour" : "plumber"}
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        filters={filters}
        searchPlaceholder={isLabour ? "Search labour..." : "Search plumbers..."}
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
          title: isLabour ? "No labour yet" : "No plumbers yet",
          description: isLabour ? "Add labour one by one or import them from Excel (Category column: Labour)." : "Add plumbers one by one or import them from Excel.",
          action: { label: `Add ${kind.toLowerCase()}`, onClick: () => setDrawerState({ open: true }) },
        }}
        actions={
          <>
            <Button type="button" variant="outline" size="compact" onClick={() => void exportRowsToExcel(isLabour ? "labour.xlsx" : "plumbers.xlsx", exportColumns, filteredPlumbers)}>
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
            <ActionTooltip label="Edit">
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
        entityLabel={kind}
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        recoverable
        note="If any selected person has wage or other records, nothing is deleted and an error is shown."
      />

      <PlumberDialog
        // New record: remount per tab, so "Add Labour" really starts as labour.
        key={drawerState.plumber?.id ?? `new-${category}`}
        open={drawerState.open}
        onOpenChange={(open) => setDrawerState((current) => ({ ...current, open }))}
        plumber={drawerState.plumber}
        category={category}
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
      entityTypeLabel={plumber.category === "labour" ? "Labour" : "Plumber"}
      note="Goes to the Recycle Bin. You can restore it within 30 days."
      impact={deleteImpact.data}
      isImpactLoading={deleteImpact.isLoading}
      isImpactError={deleteImpact.isError}
      onRetryImpact={() => void deleteImpact.refetch()}
      isDeleting={deletePlumber.isPending}
      onDelete={() => deletePlumber.mutateAsync(plumber.id)}
      isDeactivating={deactivatePlumber.isPending}
      deactivateLabel="Deactivate"
      onDeactivate={() =>
        deactivatePlumber.mutateAsync({
          name: plumber.name,
          category: plumber.category,
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
