"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DownloadSimpleIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { ListTable, useClientRows, useListState } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import type { InventoryTab } from "../types/commercial.types";
import type { MaterialSource, MaterialTransactionType } from "../types/material.types";
import { useInventoryBaseData } from "../hooks/useInventoryBaseData";
import { renderTransactionActions, useInventoryColumns } from "../hooks/useInventoryColumns";
import { useInventoryExports } from "../hooks/useInventoryExports";
import {
  useInventoryOverviewQuery,
  useInventoryTransactionsPageQuery,
  usePlumberBalancesQuery,
  useTotalIssueSummaryQuery,
} from "../hooks/useMaterials";
import { plumberBalanceRows } from "../mappers/inventory.mapper";
import { InventoryTabNav } from "./inventory/InventoryTabNav";
import { InventoryMonthFilter, inventoryFiltersToDateRange, inventoryListFilters } from "./inventory/InventoryFilterBar";
import { MaterialDrawer } from "./inventory/MaterialDrawer";
import { MaterialItemDrawer } from "./inventory/MaterialItemDrawer";
import { MaterialCategoryDrawer } from "./inventory/MaterialCategoryDrawer";
import { useUrlTab } from "@/hooks/useUrlTab";

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
  const [activeTab, setActiveTab] = useUrlTab<InventoryTab>(
    ["stock", "purchase", "pbgIssue", "pbgConsumption", "storeIssue", "totalIssue", "plumberBalance", "plumberConsumption"],
    "stock",
  );
  // One list state for the page: filters carry across tabs (as before); paging resets per tab.
  const urlProjectId = useSearchParams().get("projectId");
  const list = useListState({ pageSize: 50, storageKey: "inventory", initialFilters: urlProjectId ? { projectId: urlProjectId } : {} });

  function handleTabChange(tab: InventoryTab) {
    setActiveTab(tab);
    list.setPage(1);
  }

  const showPlumberFilter = PLUMBER_FILTER_TABS.has(activeTab);
  const showMonthFilter = !MONTH_FILTER_EXCLUDED_TABS.has(activeTab);
  const effectivePlumberId = showPlumberFilter ? list.filters.plumberId || undefined : undefined;
  const month = list.filters.month ?? "";
  const { from, to } = useMemo(() => inventoryFiltersToDateRange(month), [month]);
  const sourceFilter = (list.filters.source || undefined) as MaterialSource | undefined;
  const projectFilter = list.filters.projectId || undefined;
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
  const transactionsQuery = useInventoryTransactionsPageQuery(
    {
      type: transactionTypes && transactionTypes.length === 1 ? transactionTypes[0] : undefined,
      types: transactionTypes && transactionTypes.length > 1 ? transactionTypes : undefined,
      source: sourceFilter,
      projectId: projectFilter,
      plumberId: effectivePlumberId,
      from,
      to,
      page: list.page,
      limit: list.pageSize,
    },
    isTransactionTab,
  );
  const activeTransactions = transactionsQuery.data?.rows ?? [];

  const totalIssueQuery = useTotalIssueSummaryQuery({ source: sourceFilter, projectId: projectFilter, from, to }, activeTab === "totalIssue");

  const plumberBalancesQuery = usePlumberBalancesQuery(
    { source: sourceFilter, projectId: projectFilter, plumberId: effectivePlumberId },
    activeTab === "plumberBalance",
  );
  const plumberBalanceRowsData = useMemo(() => plumberBalanceRows(plumberBalancesQuery.data ?? []), [plumberBalancesQuery.data]);

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

  // Client-side tabs: stock catalog and the two server aggregates are fully loaded.
  const stockView = useClientRows(materials, list, { columns: stockColumns });
  const totalIssueView = useClientRows(totalIssueQuery.data ?? [], list, { columns: totalIssueColumns });
  const plumberBalanceView = useClientRows(plumberBalanceRowsData, list, { columns: plumberBalanceColumns });

  const filters = inventoryListFilters({ projects, plumbers, showPlumberFilter });

  const toolbarActions = (
    <>
      {showMonthFilter ? <InventoryMonthFilter value={month} onChange={(value) => list.setFilter("month", value)} /> : null}
      <Button type="button" variant="outline" size="compact" onClick={handleExport} disabled={isExportPending}>
        <DownloadSimpleIcon size={14} />
        {isExportPending ? "Exporting..." : "Export"}
      </Button>
      {activeTab === "stock" ? (
        <Button type="button" variant="outline" size="compact" onClick={() => router.push("/inventory/import")}>
          <UploadSimpleIcon size={14} />
          Import
        </Button>
      ) : null}
    </>
  );

  const shared = {
    state: list,
    filters,
    actions: toolbarActions,
    enableFullView: true,
  };

  return (
    <PageShell
      title="Inventory & Material"
      description="Stock, purchases, issues and plumber balances across purchase and PBG sources."
      actions={
        activeTab === "stock" ? (
          <>
            <MaterialCategoryDrawer />
            <MaterialItemDrawer />
          </>
        ) : TAB_ACTION_TYPE[activeTab] ? (
          <MaterialDrawer type={TAB_ACTION_TYPE[activeTab]} />
        ) : null
      }
      tabs={<InventoryTabNav activeTab={activeTab} onChange={handleTabChange} counts={counts} />}
    >
      {activeTab === "stock" ? (
        <ListTable
          {...shared}
          itemLabel="material"
          rows={stockView.pageRows}
          total={stockView.total}
          columns={stockColumns}
          searchPlaceholder="Search materials..."
          isLoading={materialsLoading}
          onRowClick={(row) => router.push(`/inventory/${row.id}`)}
          empty={{ illustration: "materials", title: "No materials in the catalog yet", description: "Add material items or import them from Excel." }}
        />
      ) : null}

      {isTransactionTab ? (
        <ListTable
          {...shared}
          itemLabel="record"
          rows={activeTransactions}
          total={transactionsQuery.data?.pagination?.total ?? activeTransactions.length}
          columns={transactionColumns(transactionTypes![0])}
          searchable={false}
          isLoading={transactionsQuery.isLoading}
          isError={transactionsQuery.isError}
          onRetry={() => void transactionsQuery.refetch()}
          rowActionsWidth={140}
          renderRowActions={(row) => renderTransactionActions(row)}
          empty={{ illustration: "materials", title: TRANSACTION_TAB_EMPTY_TITLE[activeTab] ?? "No records found" }}
        />
      ) : null}

      {activeTab === "totalIssue" ? (
        <ListTable
          {...shared}
          itemLabel="material"
          rows={totalIssueView.pageRows}
          total={totalIssueView.total}
          columns={totalIssueColumns}
          searchPlaceholder="Search materials..."
          isLoading={totalIssueQuery.isLoading}
          isError={totalIssueQuery.isError}
          onRetry={() => void totalIssueQuery.refetch()}
          empty={{ illustration: "materials", title: "No issued materials found" }}
        />
      ) : null}

      {activeTab === "plumberBalance" ? (
        <ListTable
          {...shared}
          itemLabel="balance"
          rows={plumberBalanceView.pageRows}
          total={plumberBalanceView.total}
          columns={plumberBalanceColumns}
          searchPlaceholder="Search plumber or material..."
          isLoading={plumberBalancesQuery.isLoading}
          isError={plumberBalancesQuery.isError}
          onRetry={() => void plumberBalancesQuery.refetch()}
          empty={{ illustration: "materials", title: "No plumber balance records found" }}
        />
      ) : null}
    </PageShell>
  );
}
