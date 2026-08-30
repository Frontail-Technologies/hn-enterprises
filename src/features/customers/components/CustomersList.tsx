"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CaretDownIcon,
  DownloadSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageShell } from "@/components/shared/PageShell";
import { exportRowsToExcel } from "@/lib/export-excel";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getCustomerMasterSheetRows,
  warnIfMasterSheetProjectionIncomplete,
  type CustomerMasterSheetRow,
} from "../services/customers.service";
import { useCustomersQuery } from "../hooks/useCustomers";
import { useCustomerColumnsQuery } from "../hooks/useCustomerColumns";
import { useDownloadCustomerRegister } from "@/features/exports/hooks/useExports";
import { useBulkCustomerSelection } from "../hooks/useBulkCustomerSelection";
import { useBulkFieldOptions } from "../hooks/useBulkFieldOptions";
import { useBulkDeleteCustomers, useBulkRemarkCustomers, useBulkUpdateCustomers } from "../hooks/useCustomerBulk";
import { buildBulkQuickSuccessMessage, type BulkQuickAction } from "../utils/bulk-quick-actions";
import { BulkActionToolbar } from "./bulk/BulkActionToolbar";
import { BulkEditDialog } from "./bulk/BulkEditDialog";
import { BulkQuickFieldDialog } from "./bulk/BulkQuickFieldDialog";
import { BulkRemarkDialog } from "./bulk/BulkRemarkDialog";
import { BulkDeleteDialog } from "./bulk/BulkDeleteDialog";
import { CustomizeColumnsDialog } from "./CustomizeColumnsDialog";
import type { CustomerBulkChanges } from "../types/customer-bulk.types";

const CUSTOM_FILTER_GROUPS: Partial<Record<string, (row: CustomerMasterSheetRow) => string[]>> = {
  fullAddress: (row) => {
    const address = row.values.fullAddress || "";
    if (!address) return ["(Blank)"];
    return Array.from(
      new Set(
        address
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length >= 3 && !/^\d+$/.test(part)),
      ),
    );
  },
};

interface CustomersListProps {
  projectId?: string;
  embedded?: boolean;
  statKey?: string;
}

export function CustomersList({ projectId, embedded = false, statKey }: CustomersListProps = {}) {
  const router = useRouter();
  const [masterSheetSearch, setMasterSheetSearch] = useState("");
  const { data: customers = [], isLoading } = useCustomersQuery({ projectId, statKey });
  const { data: resolvedColumns = [], isLoading: columnsLoading } = useCustomerColumnsQuery();
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

  const masterSheetColumns: ExcelColumn<CustomerMasterSheetRow>[] = useMemo(() => {
    const columns: ExcelColumn<CustomerMasterSheetRow>[] = resolvedColumns
      .filter((column) => column.visible)
      .map((column) => ({
        key: column.key,
        label: column.label,
        width: column.width,
        getValue: (row) => row.values[column.key],
        getFilterGroups: CUSTOM_FILTER_GROUPS[column.key],
      }));
    const scoped = projectId ? columns.filter((column) => column.key !== "projectName") : columns;
    return scoped.map((column, index) => (index < 4 ? { ...column, sticky: true } : column));
  }, [resolvedColumns, projectId]);

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

  const actions = (
    <>
      <div className="relative w-70 shrink-0 sm:w-80">
        <MagnifyingGlassIcon
          size={15}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={masterSheetSearch}
          onChange={(event) => setMasterSheetSearch(event.target.value)}
          placeholder="Search master sheet..."
          className="h-9 pl-9"
        />
      </div>
      <CustomizeColumnsDialog />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline">
              More
              <CaretDownIcon size={14} />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href="/customers/import" />}>
            <UploadSimpleIcon size={14} />
            Import Excel
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleExportRegister}
            disabled={downloadRegister.isPending}
          >
            <DownloadSimpleIcon size={14} />
            {downloadRegister.isPending ? "Exporting..." : "Export Register"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        {...(embedded
          ? { maxHeightClassName: "h-[calc(100vh-420px)]" }
          : { fillHeight: true, enableFullView: true })}
        emptyTitle="No customer master records found"
        isLoading={isLoading || columnsLoading}
        onRowClick={handleRowClick}
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
      fillHeight
    >
      {table}
    </PageShell>
  );
}
