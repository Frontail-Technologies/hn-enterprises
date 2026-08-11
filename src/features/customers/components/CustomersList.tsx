"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DownloadSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageShell } from "@/components/shared/PageShell";
import { TablePanel } from "@/components/shared/TablePanel";
import { exportRowsToExcel } from "@/lib/export-excel";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  buildCustomerMasterSheetColumns,
  getCustomerMasterSheetRows,
  type CustomerMasterSheetRow,
} from "../services/customers.service";
import { useCustomersQuery } from "../hooks/useCustomers";
import { useDynamicFieldsQuery } from "@/features/dynamic-fields/hooks/useDynamicFields";
import { useBulkCustomerSelection } from "../hooks/useBulkCustomerSelection";
import { useBulkFieldOptions } from "../hooks/useBulkFieldOptions";
import { useBulkDeleteCustomers, useBulkRemarkCustomers, useBulkUpdateCustomers } from "../hooks/useCustomerBulk";
import { buildBulkQuickSuccessMessage, type BulkQuickAction } from "../utils/bulk-quick-actions";
import { BulkActionToolbar } from "./bulk/BulkActionToolbar";
import { BulkEditDialog } from "./bulk/BulkEditDialog";
import { BulkQuickFieldDialog } from "./bulk/BulkQuickFieldDialog";
import { BulkRemarkDialog } from "./bulk/BulkRemarkDialog";
import { BulkDeleteDialog } from "./bulk/BulkDeleteDialog";
import type { CustomerBulkChanges } from "../types/customer-bulk.types";

interface CustomersListProps {
  /** Locks the list to one project's customers (Project Details → Customers tab, §5). Server-side filtered, never client-filtered from the full table. */
  projectId?: string;
  /** Drops the standalone page chrome (PageHeader) when embedded inside another page's tab - the host page already has its own header. */
  embedded?: boolean;
  /** Pre-applies an existing customer stat filter (e.g. "gi-bill-done") server-side - the Billing tab's KPI drill-down uses this. */
  statKey?: string;
}

export function CustomersList({ projectId, embedded = false, statKey }: CustomersListProps = {}) {
  const router = useRouter();
  const [masterSheetSearch, setMasterSheetSearch] = useState("");
  const { data: customers = [], isLoading } = useCustomersQuery({ projectId, statKey });
  const { data: activeCustomFields = [] } = useDynamicFieldsQuery("Active");
  const realCustomerIds = useMemo(() => new Set(customers.map((customer) => customer.id)), [customers]);
  const { user } = useAuth();
  const canBulkEdit = user?.role === "admin" || user?.role === "super_admin";
  const canBulkRemark = canBulkEdit || user?.role === "supervisor";
  const canBulkDelete = canBulkEdit;

  const [gridContext, setGridContext] = useState<{
    filteredIds: string[];
    pageIds: string[];
    filterSignature: string;
  }>({ filteredIds: [], pageIds: [], filterSignature: "" });
  const bulkSelectionSignature = `${masterSheetSearch}::${gridContext.filterSignature}`;
  const selection = useBulkCustomerSelection(bulkSelectionSignature);

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

  // The general multi-field editor: a specific one-line toast when exactly
  // one field actually changed, otherwise the mutation hook's generic
  // "N customer records updated." default.
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

  const masterSheetColumns: ExcelColumn<CustomerMasterSheetRow>[] = useMemo(() => {
    const columns: ExcelColumn<CustomerMasterSheetRow>[] = buildCustomerMasterSheetColumns(activeCustomFields).map(
      (column) => ({
        ...column,
        getValue: (row) => row.values[column.key],
      }),
    );
    // Every row already belongs to the current project when the list is
    // locked to one (§10) - the Project column would just repeat the same
    // value on every row, so it's dropped here only (never on the
    // standalone Customers page, where it's still the useful filter it always was).
    return projectId ? columns.filter((column) => column.key !== "projectName") : columns;
  }, [activeCustomFields, projectId]);

  const filteredMasterSheetRows = useMemo(() => {
    const search = masterSheetSearch.trim().toLowerCase();
    if (!search) return masterSheetRows;

    return masterSheetRows.filter((row) =>
      masterSheetColumns.some((column) => {
        const value = column.getValue(row);
        return String(value ?? "").toLowerCase().includes(search);
      }),
    );
  }, [masterSheetColumns, masterSheetRows, masterSheetSearch]);

  const showSelectAllBanner =
    gridContext.pageIds.length > 0 &&
    gridContext.pageIds.every((id) => selection.selectedIds.has(id)) &&
    selection.selectedIds.size < gridContext.filteredIds.length;

  function handleExportSelected() {
    const selectedRows = filteredMasterSheetRows.filter((row) => selection.selectedIds.has(row.id));
    void exportRowsToExcel("customers-selected.xlsx", masterSheetColumns, selectedRows);
  }

  // Project Details → Customers → Add Customer already knows which project
  // it's for, so it's passed through instead of making the user pick the
  // same project again on the form (§24).
  const newCustomerHref = projectId ? `/customers/new?projectId=${projectId}` : "/customers/new";

  const actions = (
    <>
      <Link
        href="/customers/import"
        className={buttonVariants({ variant: "outline", size: "default" })}
      >
        <UploadSimpleIcon size={15} />
        Import Excel
      </Link>
      <button
        type="button"
        className={buttonVariants({ variant: "outline", size: "default" })}
        onClick={() => void exportRowsToExcel("customers.xlsx", masterSheetColumns, filteredMasterSheetRows)}
      >
        <DownloadSimpleIcon size={15} />
        Export Excel
      </button>
      <Link
        href={newCustomerHref}
        className={buttonVariants({ variant: "default", size: "default" })}
      >
        <PlusIcon size={15} />
        Add Customer
      </Link>
    </>
  );

  const table = (
    <>
      <TablePanel
        title="Customer Master Sheet"
        subtitle="Excel-style customer master data with fixed customer columns and per-column filters."
        toolbar={
          <div className="relative max-w-md">
            <MagnifyingGlassIcon
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={masterSheetSearch}
              onChange={(event) => setMasterSheetSearch(event.target.value)}
              placeholder="Search master sheet..."
              className="h-9 pl-9"
            />
          </div>
        }
      >
        <BulkActionToolbar
          selectedCount={selection.selectedIds.size}
          matchingCount={gridContext.filteredIds.length}
          showSelectAllBanner={showSelectAllBanner}
          onSelectAllMatching={() => selection.selectAllMatching(gridContext.filteredIds)}
          onClear={selection.clear}
          onOpenQuickAction={openQuickAction}
          onOpenBulkEdit={() => setEditDialogOpen(true)}
          onOpenRemark={() => setRemarkDialogOpen(true)}
          onExportSelected={handleExportSelected}
          onOpenDelete={() => setDeleteDialogOpen(true)}
          canEdit={canBulkEdit}
          canRemark={canBulkRemark}
          canDelete={canBulkDelete}
        />
        <ExcelDataGrid
          columns={masterSheetColumns}
          rows={filteredMasterSheetRows}
          maxHeightClassName={embedded ? "h-[calc(100vh-420px)]" : "h-[calc(100vh-240px)]"}
          emptyTitle="No customer master records found"
          isLoading={isLoading}
          onRowClick={(row) => {
            if (realCustomerIds.has(row.customerId)) {
              router.push(`/customers/${row.customerId}/edit`);
            }
          }}
          getRowClassName={(row) =>
            cn(
              !realCustomerIds.has(row.customerId) && "cursor-default text-muted-foreground",
              selection.selectedIds.has(row.id) && "bg-primary/5 hover:bg-primary/10",
            )
          }
          selection={{
            selectedIds: selection.selectedIds,
            onToggleRow: selection.toggleRow,
            onTogglePage: selection.toggleAllOnPage,
            getRowLabel: (row) => `Select ${row.values.customerName || "customer"}`,
          }}
          onVisibleRowsChange={setGridContext}
        />
      </TablePanel>

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
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDeleteConfirm}
      />
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Customers</h2>
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </div>
        {table}
      </div>
    );
  }

  return (
    <PageShell
      title="Customers"
      subtitle="Manage customer connections, field assignment, meters, and stages."
      actions={actions}
    >
      {table}
    </PageShell>
  );
}
