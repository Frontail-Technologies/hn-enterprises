"use client";

import { useState } from "react";
import { ArrowsClockwiseIcon, DownloadSimpleIcon, PackageIcon, TrayArrowDownIcon, TrayArrowUpIcon, ArrowUUpLeftIcon } from "@phosphor-icons/react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ExcelDataGrid } from "@/components/shared/ExcelDataGrid";
import { Pagination } from "@/components/shared/Pagination";
import { PageHeader } from "@/components/shared/PageHeader";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { Button } from "@/components/ui/button";
import { exportRowsToExcel } from "@/lib/export-excel";
import { formatCompactCount } from "@/lib/format";
import { useInventoryDetailColumns } from "../hooks/inventory-detail.columns";
import { plumberLedgerRows as buildPlumberLedgerRows } from "../mappers/inventory-detail.mapper";
import {
  useMaterialDetailTransactionsQuery,
  useMaterialOverviewQuery,
  useMaterialPlumberLedgerQuery,
} from "../hooks/useMaterials";
import type { InventoryDetailTab } from "../types/material.types";
import { InventoryActions } from "./inventory/InventoryActions";
import { StockStatus } from "./inventory/StockStatus";
import { PageLoading } from "@/components/shared/PageLoading";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";

const PAGE_SIZE = 50;

const detailTabs: { id: InventoryDetailTab; label: string }[] = [
  { id: "purchase", label: "Purchase / PBG Received" },
  { id: "storeIssue", label: "Store Issue Book" },
  { id: "consumption", label: "Customer / BP Consumption" },
  { id: "plumberLedger", label: "Plumber Ledger" },
  { id: "transactions", label: "Transaction History" },
];

export function InventoryDetailPage({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<InventoryDetailTab>("purchase");
  const [page, setPage] = useState(1);

  // Each tab is its own independently-paginated dataset, so switching tabs
  // starts back at page 1.
  function handleTabChange(tab: InventoryDetailTab) {
    setActiveTab(tab);
    setPage(1);
  }

  const { data: overview, isLoading, isError } = useMaterialOverviewQuery(id);
  const material = overview?.material;
  useBreadcrumbLabel(id, material?.name);

  const isListableTab = activeTab !== "plumberLedger";
  const { data: transactionsResult, isLoading: transactionsLoading } = useMaterialDetailTransactionsQuery(
    id,
    { tab: isListableTab ? activeTab : "transactions", page, limit: PAGE_SIZE },
    isListableTab,
  );
  const transactionRows = transactionsResult?.rows ?? [];
  const pagination = transactionsResult?.pagination;

  const { data: plumberBalances = [], isLoading: plumberBalancesLoading } = useMaterialPlumberLedgerQuery(
    id,
    activeTab === "plumberLedger",
  );
  const plumberLedgerRows = buildPlumberLedgerRows(plumberBalances);

  const { purchaseColumns, storeIssueColumns, transactionColumns, consumptionColumns, plumberBalanceColumns } =
    useInventoryDetailColumns({ material });

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !material || !overview) {
    return <p className="p-4 text-sm text-destructive">Unable to load this material.</p>;
  }

  const { summary } = overview;

  const columnsByTab: Record<Exclude<InventoryDetailTab, "plumberLedger">, typeof purchaseColumns> = {
    purchase: purchaseColumns,
    storeIssue: storeIssueColumns,
    consumption: consumptionColumns,
    transactions: transactionColumns,
  };

  const emptyTitleByTab: Record<InventoryDetailTab, string> = {
    purchase: "No purchase rows found",
    storeIssue: "No issue rows found",
    consumption: "No customer consumption found for this material",
    plumberLedger: "No plumber balance for this material",
    transactions: "No transactions found",
  };

  function handleExport() {
    if (activeTab === "plumberLedger") {
      void exportRowsToExcel(`${material?.name}-plumber-ledger.xlsx`, plumberBalanceColumns, plumberLedgerRows);
      return;
    }
    // Exports exactly what's currently loaded for this tab (the current
    // page), never a silently-truncated "everything" - see item 11 of the
    // API optimization batch. For a multi-page tab that's the current page
    // only, which the filename makes explicit.
    const suffix = pagination && pagination.totalPages > 1 ? `-page-${pagination.page}` : "";
    void exportRowsToExcel(`${material?.name}-${activeTab}${suffix}.xlsx`, columnsByTab[activeTab], transactionRows);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={material.name}
        actions={
          <div className="grid grid-cols-2 gap-2 sm:contents">
            <Button type="button" variant="outline" size="compact" onClick={handleExport}>
              <DownloadSimpleIcon size={12} />
              {activeTab !== "plumberLedger" && pagination && pagination.totalPages > 1
                ? "Export Current Page"
                : "Export Excel"}
            </Button>
            <InventoryActions material={material} />
          </div>
        }
      />

      <section className="space-y-3">
        <CompactStatGrid columns={5}>
          <DashboardStatCard label="Available" value={`${formatCompactCount(summary.availableQty)} ${material.unit}`} icon={PackageIcon} tone="primary" dense />
          <DashboardStatCard label="Received" value={formatCompactCount(summary.receivedQty)} icon={TrayArrowDownIcon} tone="info" dense />
          <DashboardStatCard label="Issued" value={formatCompactCount(summary.issuedQty)} icon={TrayArrowUpIcon} tone="warning" dense />
          <DashboardStatCard label="Consumed" value={formatCompactCount(summary.consumedQty)} icon={ArrowsClockwiseIcon} tone="danger" dense />
          <DashboardStatCard label="Returned" value={formatCompactCount(summary.returnedQty)} icon={ArrowUUpLeftIcon} tone="success" dense />
        </CompactStatGrid>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-card border border-border bg-card px-3.5 py-2.5 text-xs">
          <StockStatus row={material} />
          <span className="text-muted-foreground">
            Unit: <b className="font-semibold text-foreground">{material.unit}</b>
          </span>
          <span className="text-muted-foreground">
            Reorder Level: <b className="font-semibold text-foreground">{material.reorderLevel}</b>
          </span>
          <span className="text-muted-foreground">
            Plumber Balances: <b className="font-semibold text-foreground">{summary.plumberBalanceCount}</b>
          </span>
        </div>
      </section>

      <div className="space-y-3">
        <UnderlineTabs items={detailTabs} active={activeTab} onChange={(tab) => handleTabChange(tab as InventoryDetailTab)} />

        {activeTab === "plumberLedger" ? (
          <ExcelDataGrid
            columns={plumberBalanceColumns}
            rows={plumberLedgerRows}
            maxHeightClassName="max-h-[50vh]"
            enableFullView
            emptyTitle={emptyTitleByTab.plumberLedger}
            isLoading={plumberBalancesLoading}
          />
        ) : (
          <>
            <ExcelDataGrid
              columns={columnsByTab[activeTab]}
              rows={transactionRows}
              maxHeightClassName="max-h-[50vh]"
              enableFullView
              emptyTitle={emptyTitleByTab[activeTab]}
              isLoading={transactionsLoading}
            />
            {pagination && pagination.total > 0 ? (
              <Pagination
                compact
                page={pagination.page}
                pageCount={Math.max(1, pagination.totalPages)}
                totalItems={pagination.total}
                startItem={(pagination.page - 1) * pagination.limit + 1}
                endItem={Math.min(pagination.page * pagination.limit, pagination.total)}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
