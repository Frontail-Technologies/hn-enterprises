"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnFiltersState } from "@tanstack/react-table";
import {
  CaretDownIcon,
  DownloadSimpleIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListTable, useListState, type ListColumn } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CUSTOM_FILTER_GROUPS, type CustomerMasterSheetRow } from "../config/customer-columns";
import { isServerFilterableMasterKey } from "../config/customer-filter-columns";
import { getCustomerMasterSheetRows, warnIfMasterSheetProjectionIncomplete } from "../mappers/customer-master-sheet.mapper";
import { customersApi } from "../api/customers.api";
import { useCustomersListQuery, type CustomersListParams } from "../queries/useCustomersQuery";
import { useCustomerColumnsQuery } from "../queries/useCustomerColumns";
import { useDownloadCustomerRegister } from "@/features/exports/hooks/useExports";
import { useBulkCustomerSelection } from "../hooks/useBulkCustomerSelection";
import { useBulkFieldOptions } from "../hooks/useBulkFieldOptions";
import { useBulkDeleteCustomers, useBulkRemarkCustomers, useBulkUpdateCustomers } from "../hooks/useCustomerBulk";
import { buildBulkQuickSuccessMessage, type BulkQuickAction } from "../utils/bulk-quick-actions";
import { BulkActionToolbar } from "./bulk/BulkActionToolbar";
import { BulkEditDialog } from "./bulk/BulkEditDialog";
import { BulkQuickFieldDialog } from "./bulk/BulkQuickFieldDialog";
import { BulkRemarkDialog } from "./bulk/BulkRemarkDialog";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ReplaceTempIdsDialog } from "./ReplaceTempIdsDialog";
import { BulkPdfDialog } from "./bulk/BulkPdfDialog";
import { CustomizeColumnsDialog } from "./CustomizeColumnsDialog";
import type { CustomerBulkChanges } from "../types/customer-bulk.types";

interface CustomersListProps {
  projectId?: string;
  embedded?: boolean;
  statKey?: string;
}

const PAGE_SIZE = 50;

// Only these 3 master-sheet columns are sortable server-side - they mirror
// exactly the fields the backend's own search already covers. Every other
// column (joined/derived/JSON-section values) has no DB column to sort by.
const SORTABLE_MASTER_KEY_TO_BACKEND_FIELD: Record<string, CustomersListParams["sortBy"]> = {
  customerName: "customerName",
  trBpNo: "trBpNumber",
  mobileNo: "mobileNumber",
};

/** Readable names for the stage filters linked from Project detail (`?statKey=`). */
const STAGE_FILTER_LABELS: Record<string, string> = {
  "survey-done": "survey done",
  "gi-done": "GI done",
  "gc-done": "GC done",
  "conversion-done": "conversion done",
  "jmr-done": "JMR done",
  "gi-bill-done": "GI billed",
  "gc-bill-done": "GC billed",
  "conversion-bill-done": "conversion billed",
};

export function CustomersList({ projectId, embedded = false, statKey }: CustomersListProps = {}) {
  const router = useRouter();
  // Search, page, page size and sort live in the shared list state; column
  // filters stay controlled here because they are sent to the server.
  const list = useListState({ pageSize: PAGE_SIZE });
  const masterSheetSearch = list.search;
  const debouncedSearch = list.debouncedSearch;
  const page = list.page;
  const sortBy: CustomersListParams["sortBy"] = list.sort ? SORTABLE_MASTER_KEY_TO_BACKEND_FIELD[list.sort.id] : undefined;
  const sortOrder: "asc" | "desc" | undefined = sortBy ? (list.sort?.desc ? "desc" : "asc") : undefined;
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // Only customers still waiting for their real BR/TR number (TEMP-... IDs).
  const [tempOnly, setTempOnly] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  const columnFiltersRecord = useMemo(() => {
    const record: Record<string, string[]> = {};
    for (const filter of columnFilters) {
      const values = filter.value as string[] | undefined;
      if (Array.isArray(values) && values.length) record[filter.id] = values;
    }
    return record;
  }, [columnFilters]);

  const { data: customersResult, isLoading, isError, refetch } = useCustomersListQuery({
    projectId,
    statKey,
    search: debouncedSearch || undefined,
    page,
    limit: list.pageSize,
    sortBy,
    sortOrder,
    columnFilters: columnFiltersRecord,
    tempIds: tempOnly || undefined,
  });
  const customers = useMemo(() => customersResult?.data ?? [], [customersResult]);
  const pagination = customersResult?.pagination;

  const { data: resolvedColumns = [], isLoading: columnsLoading } = useCustomerColumnsQuery();
  const realCustomerIds = useMemo(() => new Set(customers.map((customer) => customer.id)), [customers]);
  const { user } = useAuth();
  const canBulkEdit = user?.role === "admin" || user?.role === "super_admin";
  const canBulkRemark = canBulkEdit || user?.role === "supervisor";
  const canBulkDelete = canBulkEdit;

  function handleGridColumnFiltersChange(next: ColumnFiltersState) {
    setColumnFilters(next);
    list.setPage(1);
  }

  const [gridContext, setGridContext] = useState<{
    filteredIds: string[];
    filterSignature: string;
  }>({ filteredIds: [], filterSignature: "" });
  // Deliberately excludes `page` - selection persists by customer ID across
  // page changes. It still clears when the search or column filters change,
  // matching the pre-pagination behavior.
  const bulkSelectionSignature = `${debouncedSearch}::${gridContext.filterSignature}`;
  const selection = useBulkCustomerSelection(bulkSelectionSignature);
  const [isExportingSelected, setIsExportingSelected] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [quickActionDialogOpen, setQuickActionDialogOpen] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<BulkQuickAction | null>(null);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const bulkFieldOptions = useBulkFieldOptions();
  const bulkUpdate = useBulkUpdateCustomers();
  const bulkRemark = useBulkRemarkCustomers();
  const bulkDelete = useBulkDeleteCustomers();

  function openQuickAction(action: BulkQuickAction) {
    setActiveQuickAction(action);
    setQuickActionDialogOpen(true);
  }

  async function handleBulkEditSubmit(changes: CustomerBulkChanges, changeSummary: string[]) {
    const count = selection.selectedIds.size;
    const successMessage =
      changeSummary.length === 1
        ? `${count} customer${count === 1 ? "" : "s"} updated — ${changeSummary[0]}.`
        : undefined;
    await bulkUpdate.mutateAsync({ ids: Array.from(selection.selectedIds), changes, successMessage });
    setEditDialogOpen(false);
    selection.clear();
  }

  async function handleQuickActionSubmit(changes: CustomerBulkChanges) {
    if (!activeQuickAction) return;
    const count = selection.selectedIds.size;
    const successMessage = buildBulkQuickSuccessMessage(activeQuickAction, changes, count, bulkFieldOptions);
    await bulkUpdate.mutateAsync({ ids: Array.from(selection.selectedIds), changes, successMessage });
    setQuickActionDialogOpen(false);
    selection.clear();
  }

  async function handleBulkRemarkSubmit(note: string) {
    await bulkRemark.mutateAsync({ ids: Array.from(selection.selectedIds), note });
    setRemarkDialogOpen(false);
    selection.clear();
  }

  async function handleBulkDeleteConfirm() {
    await bulkDelete.mutateAsync(Array.from(selection.selectedIds));
    setDeleteDialogOpen(false);
    selection.clear();
  }

  const masterSheetRows = useMemo(() => getCustomerMasterSheetRows(customers), [customers]);

  useEffect(() => {
    warnIfMasterSheetProjectionIncomplete(resolvedColumns, masterSheetRows);
  }, [resolvedColumns, masterSheetRows]);

  const masterSheetColumns: ListColumn<CustomerMasterSheetRow>[] = useMemo(() => {
    const columns: ListColumn<CustomerMasterSheetRow>[] = resolvedColumns
      .filter((column) => column.visible)
      .map((column) => ({
        id: column.key,
        header: column.label,
        width: column.width,
        // Column choice is managed by Customize Columns (saved server-side),
        // so the list's own column picker is off for this screen.
        hideable: false,
        // Server sort only on the 3 backend-sortable fields.
        sortable: column.key in SORTABLE_MASTER_KEY_TO_BACKEND_FIELD,
        value: (row) => row.values[column.key],
        getFilterGroups: CUSTOM_FILTER_GROUPS[column.key],
        // Only the 14 columns in the server whitelist show a filter
        // affordance at all - every other column (derived/JSONB-nested,
        // dynamic custom fields, computed audit fields, project/site
        // relational fields, the display-mapped status field) would only
        // ever be page-local under real pagination, which is misleading
        // presented as a filter, so it's hidden rather than left visible
        // and wrong.
        columnFilter: isServerFilterableMasterKey(column.key),
        // Fetches distinct values scoped to the whole filtered dataset
        // instead of just this page (see customer-filter-columns.ts).
        getRemoteFilterOptions: isServerFilterableMasterKey(column.key)
          ? () =>
              customersApi.filterOptions({
                column: column.key,
                search: debouncedSearch || undefined,
                projectId,
                statKey,
                columnFilters: Object.fromEntries(
                  Object.entries(columnFiltersRecord).filter(([key]) => key !== column.key),
                ),
              })
          : undefined,
      }));
    return projectId ? columns.filter((column) => column.id !== "projectName") : columns;
  }, [resolvedColumns, projectId, statKey, debouncedSearch, columnFiltersRecord]);

  const exportColumns: ExportColumn<CustomerMasterSheetRow>[] = useMemo(
    () => masterSheetColumns.map((column) => ({ label: column.header, getValue: (row) => column.value?.(row) ?? "" })),
    [masterSheetColumns],
  );

  // The search box is now the server `search` param (name/BR-TR/mobile,
  // across the whole filtered dataset, not just this page) - matching
  // "Arbaz" and "TR-1024" both work. It no longer additionally re-filters
  // across every other master-sheet column client-side: that would only ever
  // see the current page anyway once pagination is real, so it's reported as
  // an accepted trade-off rather than silently kept as a partial/misleading
  // filter. The grid's own per-column Excel filters still run locally on top
  // of whatever page loaded, but for the ~13 server-filterable columns (see
  // customer-filter-columns.ts) `data` already arrives pre-filtered by the
  // backend, so that's a no-op there; for every other column it's the same
  // page-local filtering as before, now clearly disclosed rather than silent.
  const filteredMasterSheetRows = masterSheetRows;

  // pagination.total already reflects search + scope + every server-side
  // column filter, so it - not the current page's row count - is the right
  // number for "N customers match" and for deciding whether more than the
  // current page could still be selected.
  const matchingTotal = pagination?.total ?? gridContext.filteredIds.length;
  const showSelectAllBanner =
    gridContext.filteredIds.length > 0 &&
    gridContext.filteredIds.every((id) => selection.selectedIds.has(id)) &&
    selection.selectedIds.size < matchingTotal;

  const [isSelectingAllMatching, setIsSelectingAllMatching] = useState(false);

  async function handleSelectAllMatching() {
    if (isSelectingAllMatching) return;
    setIsSelectingAllMatching(true);
    try {
      const result = await customersApi.listMatchingIds({
        projectId,
        statKey,
        search: debouncedSearch || undefined,
        columnFilters: columnFiltersRecord,
        tempIds: tempOnly || undefined,
      });
      selection.selectAllMatching(result.ids);
      if (result.truncated) {
        // Deliberately not "all matching selected" - this is a partial
        // selection, and the wording says so explicitly rather than
        // implying completeness.
        toast.warning(
          `Selected first ${result.ids.length.toLocaleString()} of ${result.total.toLocaleString()} matching customers.`,
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to select all matching customers");
    } finally {
      setIsSelectingAllMatching(false);
    }
  }

  async function handleExportSelected() {
    if (isExportingSelected) return;
    setIsExportingSelected(true);
    try {
      // Fetches full rows for every selected ID directly (not just whichever
      // selected rows happen to be on the currently loaded page) so a
      // selection spanning multiple pages exports completely.
      const selectedCustomers = await customersApi.getByIds(Array.from(selection.selectedIds));
      const selectedRows = getCustomerMasterSheetRows(selectedCustomers);
      await exportRowsToExcel("customers-selected.xlsx", exportColumns, selectedRows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export selected customers");
    } finally {
      setIsExportingSelected(false);
    }
  }

  const handleRowClick = useCallback(
    (row: CustomerMasterSheetRow) => {
      if (realCustomerIds.has(row.customerId)) {
        router.push(`/customers/${row.customerId}/edit`);
      }
    },
    [realCustomerIds, router],
  );

  const downloadRegister = useDownloadCustomerRegister();
  const handleExportRegister = () => downloadRegister.mutate({ projectId, statKey });

  const newCustomerHref = projectId ? `/customers/new?projectId=${projectId}` : "/customers/new";

  const addCustomer = (
    <Link href={newCustomerHref} className={buttonVariants({ variant: "default", size: "compact" })}>
      <PlusIcon size={14} />
      Add Customer
    </Link>
  );

  const toolbarActions = (
    <>
      <Button
        type="button"
        variant={tempOnly ? "default" : "outline"}
        size="compact"
        aria-pressed={tempOnly}
        title="Show only customers still on a temporary ID (no BR/TR number yet)"
        onClick={() => {
          setTempOnly((current) => !current);
          list.setPage(1);
        }}
      >
        TEMP IDs
      </Button>
      {canBulkEdit ? <ReplaceTempIdsDialog triggerClassName="hidden xl:inline-flex" /> : null}
      <CustomizeColumnsDialog triggerClassName={buttonVariants({ variant: "outline", size: "compact" })} iconClassName="size-3.5" />
      <Link href="/customers/import" className={cn(buttonVariants({ variant: "outline", size: "compact" }), "hidden xl:inline-flex")}>
        <UploadSimpleIcon size={14} />
        Import Excel
      </Link>
      <Button
        type="button"
        variant="outline"
        size="compact"
        className="hidden xl:inline-flex"
        onClick={handleExportRegister}
        disabled={downloadRegister.isPending}
      >
        <DownloadSimpleIcon size={14} />
        {downloadRegister.isPending ? "Exporting..." : "Export Register"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="outline" size="compact" className="xl:hidden" />}>
          More
          <CaretDownIcon size={12} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href="/customers/import" />}>
            <UploadSimpleIcon size={14} />
            Import Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportRegister} disabled={downloadRegister.isPending}>
            <DownloadSimpleIcon size={14} />
            {downloadRegister.isPending ? "Exporting..." : "Export Register"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Embedded in Project detail there is no page header, so Add Customer sits in the toolbar. */}
      {embedded ? addCustomer : null}
    </>
  );

  const table = (
    <>
      <BulkActionToolbar
        selectedCount={selection.selectedIds.size}
        matchingCount={matchingTotal}
        showSelectAllBanner={showSelectAllBanner}
        onSelectAllMatching={handleSelectAllMatching}
        onClear={selection.clear}
        onOpenQuickAction={openQuickAction}
        onOpenBulkEdit={() => setEditDialogOpen(true)}
        onOpenRemark={() => setRemarkDialogOpen(true)}
        onExportSelected={handleExportSelected}
        onOpenPdfs={() => setPdfDialogOpen(true)}
        onOpenDelete={() => setDeleteDialogOpen(true)}
        canEdit={canBulkEdit}
        canRemark={canBulkRemark}
        canDelete={canBulkDelete}
      />
      <BulkPdfDialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen} customerIds={Array.from(selection.selectedIds)} />
      <ListTable
        itemLabel="customer"
        rows={filteredMasterSheetRows}
        total={matchingTotal}
        columns={masterSheetColumns}
        state={list}
        searchPlaceholder="Search by name, BR/TR or mobile..."
        actions={toolbarActions}
        isLoading={isLoading || columnsLoading}
        isError={isError}
        onRetry={() => void refetch()}
        empty={{ illustration: "customers", title: "No customers yet" }}
        emptyState={
          masterSheetSearch.trim() || columnFilters.length > 0 ? (
            <EmptyState
              illustration="search"
              title="No customers match your search or filters"
              description="Try a different search or clear the column filters."
            />
          ) : (
            <EmptyState
              illustration="customers"
              title="No customers yet"
              description="Add customers one by one or import them from Excel."
              action={{ label: "Add customer", onClick: () => router.push(newCustomerHref) }}
            />
          )
        }
        {...(embedded
          ? { maxHeightClassName: "max-h-[calc(100vh-420px)]" }
          : { fillHeight: true, enableFullView: true })}
        onRowClick={handleRowClick}
        getRowClassName={(row) =>
          cn(
            !realCustomerIds.has(row.customerId) && "cursor-default text-muted-foreground",
            selection.selectedIds.has(row.id) && "bg-primary/5 hover:bg-primary/10",
          )
        }
        rowSelection={selection.rowSelection}
        onRowSelectionChange={selection.setRowSelection}
        getRowLabel={(row) => `Select ${row.values.customerName || "customer"}`}
        onVisibleRowsChange={setGridContext}
        columnFilters={columnFilters}
        onColumnFiltersChange={handleGridColumnFiltersChange}
      />

      <BulkEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        selectedCount={selection.selectedIds.size}
        isSubmitting={bulkUpdate.isPending}
        onSubmit={handleBulkEditSubmit}
      />
      <BulkQuickFieldDialog
        open={quickActionDialogOpen}
        onOpenChange={setQuickActionDialogOpen}
        action={activeQuickAction}
        selectedCount={selection.selectedIds.size}
        isSubmitting={bulkUpdate.isPending}
        onSubmit={handleQuickActionSubmit}
      />
      <BulkRemarkDialog
        open={remarkDialogOpen}
        onOpenChange={setRemarkDialogOpen}
        selectedCount={selection.selectedIds.size}
        isSubmitting={bulkRemark.isPending}
        onSubmit={handleBulkRemarkSubmit}
      />
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedCount={selection.selectedIds.size}
        entityLabel="Customer"
        entityLabelPlural="Customers"
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDeleteConfirm}
        note="Customers with associated records (e.g. bills or payments) will be skipped with an error instead of partially deleted."
      />
    </>
  );

  if (embedded) {
    // Project detail already titles this section "Customers".
    return <div className="space-y-3">{table}</div>;
  }

  return (
    <PageShell
      title="Customers"
      description={
        projectId ? (
          <>
            {statKey && STAGE_FILTER_LABELS[statKey] ? `Customers of one project with ${STAGE_FILTER_LABELS[statKey]}.` : "Customers of one project."}{" "}
            {statKey ? (
              <>
                <Link href={`/customers?projectId=${encodeURIComponent(projectId)}`} className="font-medium text-primary hover:underline">
                  Clear stage
                </Link>
                {" · "}
              </>
            ) : null}
            <Link href="/customers" className="font-medium text-primary hover:underline">
              Show all customers
            </Link>
          </>
        ) : (
          "Every customer connection, with its field and billing progress."
        )
      }
      actions={addCustomer}
      fillHeight
      contentClassName="space-y-3"
    >
      {table}
    </PageShell>
  );
}
