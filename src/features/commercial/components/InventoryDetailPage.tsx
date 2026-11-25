"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, RulerIcon, TagIcon, WarningIcon } from "@phosphor-icons/react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListTable, useClientRows, useListState } from "@/components/shared/list";
import { DetailRows, RecordHeader, RecordLayout } from "@/components/shared/record";
import { SectionCard } from "@/components/shared/SectionCard";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { Button } from "@/components/ui/button";
import { exportRowsToExcel } from "@/lib/export-excel";
import { formatCompactCount } from "@/lib/format";
import { toExportColumns, useInventoryDetailColumns } from "../hooks/inventory-detail.columns";
import { renderTransactionActions } from "../hooks/useInventoryColumns";
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
import { useUrlTab } from "@/hooks/useUrlTab";

const detailTabs: { id: InventoryDetailTab; label: string }[] = [
  { id: "purchase", label: "Purchase / PBG Received" },
  { id: "storeIssue", label: "Store Issue Book" },
  { id: "consumption", label: "Customer / BP Consumption" },
  { id: "plumberLedger", label: "Plumber Ledger" },
  { id: "transactions", label: "Transaction History" },
];

export function InventoryDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useUrlTab<InventoryDetailTab>(["purchase", "storeIssue", "consumption", "plumberLedger", "transactions"], "purchase");
  const list = useListState({ pageSize: 50, storageKey: "inventory-detail" });

  // Each tab is its own independently-paginated dataset, so switching tabs
  // starts back at page 1.
  function handleTabChange(tab: InventoryDetailTab) {
    setActiveTab(tab);
    list.setPage(1);
  }

  const { data: overview, isLoading, isError } = useMaterialOverviewQuery(id);
  const material = overview?.material;
  useBreadcrumbLabel(id, material?.name);

  const isListableTab = activeTab !== "plumberLedger";
  const {
    data: transactionsResult,
    isLoading: transactionsLoading,
    isError: transactionsError,
    refetch: refetchTransactions,
  } = useMaterialDetailTransactionsQuery(
    id,
    { tab: isListableTab ? activeTab : "transactions", page: list.page, limit: list.pageSize },
    isListableTab,
  );
  const transactionRows = transactionsResult?.rows ?? [];
  const pagination = transactionsResult?.pagination;

  const {
    data: plumberBalances,
    isLoading: plumberBalancesLoading,
    isError: plumberBalancesError,
    refetch: refetchPlumberBalances,
  } = useMaterialPlumberLedgerQuery(id, activeTab === "plumberLedger");
  const plumberLedgerRows = useMemo(() => buildPlumberLedgerRows(plumberBalances ?? []), [plumberBalances]);

  const { purchaseColumns, storeIssueColumns, transactionColumns, consumptionColumns, plumberBalanceColumns } =
    useInventoryDetailColumns();
  const plumberLedgerView = useClientRows(plumberLedgerRows, list, { columns: plumberBalanceColumns });

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !material || !overview) {
    return (
      <EmptyState
        illustration="error"
        title="Couldn't load this material"
        description="It may have been removed, or the connection failed."
        action={{ label: "Back to inventory", onClick: () => router.push("/inventory") }}
      />
    );
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
      void exportRowsToExcel(`${material?.name}-plumber-ledger.xlsx`, toExportColumns(plumberBalanceColumns), plumberLedgerRows);
      return;
    }
    // Exports exactly what's currently loaded for this tab (the current
    // page), never a silently-truncated "everything" - see item 11 of the
    // API optimization batch. For a multi-page tab that's the current page
    // only, which the filename makes explicit.
    const suffix = pagination && pagination.totalPages > 1 ? `-page-${pagination.page}` : "";
    void exportRowsToExcel(`${material?.name}-${activeTab}${suffix}.xlsx`, toExportColumns(columnsByTab[activeTab]), transactionRows);
  }

  const quantity = (value: number) => `${formatCompactCount(value)} ${material.unit}`;

  return (
    <div className="flex flex-col gap-5">
      <RecordHeader
        title={material.name}
        badges={<StockStatus row={material} />}
        meta={[
          { icon: TagIcon, label: material.category },
          { icon: RulerIcon, label: `Unit: ${material.unit}` },
          { icon: WarningIcon, label: `Reorder at ${formatCompactCount(material.reorderLevel)} ${material.unit}` },
        ]}
        figure={{ label: "Available", value: quantity(summary.availableQty) }}
        actions={
          <>
            <Button type="button" variant="outline" size="compact" onClick={handleExport}>
              <DownloadSimpleIcon size={12} />
              {activeTab !== "plumberLedger" && pagination && pagination.totalPages > 1
                ? "Export Current Page"
                : "Export Excel"}
            </Button>
            <InventoryActions material={material} />
          </>
        }
      />

      <RecordLayout
        rail={
          <SectionCard title="Stock summary">
            <DetailRows
              rows={[
                { label: "Available", value: quantity(summary.availableQty) },
                { label: "Received", value: quantity(summary.receivedQty) },
                { label: "Issued", value: quantity(summary.issuedQty) },
                { label: "Consumed", value: quantity(summary.consumedQty) },
                { label: "Returned", value: quantity(summary.returnedQty) },
                { label: "Reorder level", value: quantity(material.reorderLevel) },
                { label: "Plumber balances", value: formatCompactCount(summary.plumberBalanceCount) },
              ]}
            />
          </SectionCard>
        }
      >
      <div className="space-y-3">
        <UnderlineTabs items={detailTabs} active={activeTab} onChange={(tab) => handleTabChange(tab as InventoryDetailTab)} />

        {activeTab === "plumberLedger" ? (
          <ListTable
            itemLabel="balance"
            rows={plumberLedgerView.pageRows}
            total={plumberLedgerView.total}
            columns={plumberBalanceColumns}
            state={list}
            searchPlaceholder="Search plumber or project..."
            maxHeightClassName="max-h-[50vh]"
            enableFullView
            isLoading={plumberBalancesLoading}
            isError={plumberBalancesError}
            onRetry={() => void refetchPlumberBalances()}
            empty={{ illustration: "materials", title: emptyTitleByTab.plumberLedger }}
          />
        ) : (
          <ListTable
            itemLabel="record"
            rows={transactionRows}
            total={pagination?.total ?? transactionRows.length}
            columns={columnsByTab[activeTab]}
            state={list}
            searchable={false}
            maxHeightClassName="max-h-[50vh]"
            enableFullView
            isLoading={transactionsLoading}
            isError={transactionsError}
            onRetry={() => void refetchTransactions()}
            rowActionsWidth={140}
            renderRowActions={(row) => renderTransactionActions(row, material.name)}
            empty={{ illustration: "materials", title: emptyTitleByTab[activeTab] }}
          />
        )}
      </div>
      </RecordLayout>
    </div>
  );
}
