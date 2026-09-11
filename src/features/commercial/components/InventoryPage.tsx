"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, PackageIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { ExcelDataGrid } from "@/components/shared/ExcelDataGrid";
import { Pagination } from "@/components/shared/Pagination";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InventoryTab } from "../types/commercial.types";
import type { MaterialTransactionType } from "../types/material.types";
import { useInventoryBaseData } from "../hooks/useInventoryBaseData";
import { useInventoryColumns } from "../hooks/useInventoryColumns";
import { useInventoryExports } from "../hooks/useInventoryExports";
import {
  useInventoryOverviewQuery,
  useInventoryTransactionsPageQuery,
  usePlumberBalancesQuery,
  useTotalIssueSummaryQuery,
} from "../hooks/useMaterials";
import { plumberBalanceRows } from "../mappers/inventory.mapper";
import { InventoryTabNav } from "./inventory/InventoryTabNav";
import {
  EMPTY_INVENTORY_FILTERS,
  InventoryFilterBar,
  inventoryFiltersToDateRange,
  type InventoryFilterState,
} from "./inventory/InventoryFilterBar";
import { MaterialDrawer } from "./inventory/MaterialDrawer";
import { MaterialItemDrawer } from "./inventory/MaterialItemDrawer";
import { MaterialCategoryDrawer } from "./inventory/MaterialCategoryDrawer";

const PAGE_SIZE = 50;

const PLUMBER_FILTER_TABS = new Set<InventoryTab>(["storeIssue", "plumberBalance", "plumberConsumption"]);

const MONTH_FILTER_EXCLUDED_TABS = new Set<InventoryTab>(["stock", "plumberBalance"]);

// One request per active tab only - the previous 5 unconditional
// transaction queries are gone. "totalIssue" and "plumberBalance" aren't
// here because they use their own dedicated server-aggregate queries, not
// a raw transaction list.
const TRANSACTION_TAB_TYPES: Partial<Record<InventoryTab, MaterialTransactionType[]>> = {
  purchase: ["purchase"],
  pbgIssue: ["pbg_issue"],
  pbgConsumption: ["pbg_consumption"],
  storeIssue: ["issue"],
  plumberConsumption: ["consumption", "pbg_consumption"],
};

const TRANSACTION_TAB_EMPTY_TITLE: Partial<Record<InventoryTab, string>> = {
  purchase: "No purchase records found",
  pbgIssue: "No PBG issue records found",
  pbgConsumption: "No PBG consumption records found",
  storeIssue: "No store issue records found",
  plumberConsumption: "No consumption records found",
};

const TAB_ACTION_TYPE: Partial<Record<InventoryTab, MaterialTransactionType>> = {
  purchase: "purchase",
  pbgIssue: "pbg_issue",
  pbgConsumption: "pbg_consumption",
  storeIssue: "issue",
  plumberBalance: "adjustment",
  plumberConsumption: "consumption",
};

export function InventoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InventoryTab>("stock");
  const [filters, setFilters] = useState<InventoryFilterState>(EMPTY_INVENTORY_FILTERS);
  const [page, setPage] = useState(1);

  function handleTabChange(tab: InventoryTab) {
    setActiveTab(tab);
    setPage(1);
  }

  function handleFiltersChange(next: InventoryFilterState) {
    setFilters(next);
    setPage(1);
  }

  const showPlumberFilter = PLUMBER_FILTER_TABS.has(activeTab);
  const effectivePlumberId = showPlumberFilter ? filters.plumberId || undefined : undefined;
  const { from, to } = useMemo(() => inventoryFiltersToDateRange(filters.month), [filters.month]);
  const sourceFilter = filters.source || undefined;
  const projectFilter = filters.projectId || undefined;
  const stockFiltered = Boolean(sourceFilter || projectFilter);

  const { materials, materialsLoading, plumbers, projects, stockBalanceByMaterialId } = useInventoryBaseData({
    source: sourceFilter,
    projectId: projectFilter,
    stockFiltered,
  });

  // Tab badges - one request, DB-side COUNT/GROUP BY, never the full
  // transaction rows. Always fetched (cheap, and every tab's badge needs
  // to stay visible while switching tabs).
  const { data: overview } = useInventoryOverviewQuery({
    source: sourceFilter,
    projectId: projectFilter,
    plumberId: effectivePlumberId,
    from,
    to,
  });

  const transactionTypes = TRANSACTION_TAB_TYPES[activeTab];
  const isTransactionTab = Boolean(transactionTypes);
  const { data: transactionsResult, isLoading: transactionsLoading } = useInventoryTransactionsPageQuery(
    {
      type: transactionTypes && transactionTypes.length === 1 ? transactionTypes[0] : undefined,
      types: transactionTypes && transactionTypes.length > 1 ? transactionTypes : undefined,
      source: sourceFilter,
      projectId: projectFilter,
      plumberId: effectivePlumberId,
      from,
      to,
      page,
      limit: PAGE_SIZE,
    },
    isTransactionTab,
  );
  const activeTransactions = transactionsResult?.rows ?? [];
  const transactionsPagination = transactionsResult?.pagination;

  const { data: totalIssueRowsData = [], isLoading: totalIssueLoading } = useTotalIssueSummaryQuery(
    { source: sourceFilter, projectId: projectFilter, from, to },
    activeTab === "totalIssue",
  );

  const { data: plumberBalances = [], isLoading: plumberBalancesLoading } = usePlumberBalancesQuery(
    { source: sourceFilter, projectId: projectFilter, plumberId: effectivePlumberId },
    activeTab === "plumberBalance",
  );
  const plumberBalanceRowsData = plumberBalanceRows(plumberBalances);

  const { isExportPending, handleExport } = useInventoryExports({
    activeTab,
    projectId: projectFilter,
    source: sourceFilter,
    plumberId: effectivePlumberId,
    from,
    to,
  });

  const counts: Partial<Record<InventoryTab, number>> = {
    stock: overview?.stockCount,
    purchase: overview?.purchaseCount,
    pbgIssue: overview?.pbgIssueCount,
    pbgConsumption: overview?.pbgConsumptionCount,
    storeIssue: overview?.storeIssueCount,
    totalIssue: overview?.totalIssueCount,
    plumberBalance: overview?.plumberBalanceCount,
    plumberConsumption: overview?.plumberConsumptionCount,
  };

  const { stockColumns, transactionColumns, totalIssueColumns, plumberBalanceColumns } = useInventoryColumns({
    stockFiltered,
    stockBalanceByMaterialId,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory & Material"
        icon={PackageIcon}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <div className={cn("grid gap-2 sm:contents", activeTab === "stock" ? "grid-cols-3" : "grid-cols-2")}>
              <InventoryFilterBar
                filters={filters}
                onChange={handleFiltersChange}
                projects={projects}
                plumbers={plumbers}
                showPlumberFilter={showPlumberFilter}
                showMonthFilter={!MONTH_FILTER_EXCLUDED_TABS.has(activeTab)}
              />

              <Button type="button" variant="outline" size="compact" onClick={handleExport} disabled={isExportPending}>
                <DownloadSimpleIcon size={12} />
                {isExportPending ? "Exporting..." : "Export"}
              </Button>

              {activeTab === "stock" ? (
                <Button type="button" variant="outline" size="compact" onClick={() => router.push("/inventory/import")}>
                  <UploadSimpleIcon size={12} />
                  Import
                </Button>
              ) : null}
            </div>

            {activeTab === "stock" ? (
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <MaterialCategoryDrawer />
                <MaterialItemDrawer />
              </div>
            ) : TAB_ACTION_TYPE[activeTab] ? (
              <div className="grid grid-cols-1 gap-2 sm:contents">
                <MaterialDrawer type={TAB_ACTION_TYPE[activeTab]} />
              </div>
            ) : null}
          </div>
        }
      />
      <InventoryTabNav activeTab={activeTab} onChange={handleTabChange} counts={counts} />

      {activeTab === "stock" ? (
        <ExcelDataGrid
          columns={stockColumns}
          rows={materials}
          emptyTitle="No materials in the catalog yet"
          isLoading={materialsLoading}
          onRowClick={(row) => router.push(`/inventory/${row.id}`)}
          enableFullView
        />
      ) : null}

      {isTransactionTab ? (
        <>
          <ExcelDataGrid
            columns={transactionColumns(transactionTypes![0])}
            rows={activeTransactions}
            emptyTitle={TRANSACTION_TAB_EMPTY_TITLE[activeTab] ?? "No records found"}
            isLoading={transactionsLoading}
            enableFullView
          />
          {transactionsPagination && transactionsPagination.total > 0 ? (
            <Pagination
              compact
              page={transactionsPagination.page}
              pageCount={Math.max(1, transactionsPagination.totalPages)}
              totalItems={transactionsPagination.total}
              startItem={(transactionsPagination.page - 1) * transactionsPagination.limit + 1}
              endItem={Math.min(transactionsPagination.page * transactionsPagination.limit, transactionsPagination.total)}
              onPageChange={setPage}
            />
          ) : null}
        </>
      ) : null}

      {activeTab === "totalIssue" ? (
        <ExcelDataGrid columns={totalIssueColumns} rows={totalIssueRowsData} emptyTitle="No issued materials found" isLoading={totalIssueLoading} enableFullView />
      ) : null}

      {activeTab === "plumberBalance" ? (
        <ExcelDataGrid
          columns={plumberBalanceColumns}
          rows={plumberBalanceRowsData}
          emptyTitle="No plumber balance records found"
          isLoading={plumberBalancesLoading}
          enableFullView
        />
      ) : null}
    </div>
  );
}
