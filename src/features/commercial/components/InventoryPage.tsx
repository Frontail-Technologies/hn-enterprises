"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CaretDownIcon, DownloadSimpleIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDownloadInventoryConsumptionLog,
  useDownloadInventoryPbgConsumption,
  useDownloadInventoryPbgIssue,
  useDownloadInventoryPlumberBalance,
  useDownloadInventoryPurchaseRegister,
  useDownloadInventoryStockSheet,
  useDownloadInventoryStoreIssueBook,
  useDownloadInventoryTotalIssue,
} from "@/features/exports/hooks/useExports";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import type { InventoryTab } from "../types/commercial.types";
import type {
  Material,
  MaterialTransaction,
  MaterialTransactionType,
  PlumberBalance,
} from "../types/material.types";

import { computeStockStatus, formatDate, projectLabel, sourceLabel } from "../utils/format";
import {
  useMaterialsQuery,
  useMaterialTransactionsQuery,
  usePlumberBalancesQuery,
  useStockBalancesQuery,
} from "../hooks/useMaterials";
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
import { TransactionRowActions } from "./inventory/TransactionRowActions";

const PLUMBER_FILTER_TABS = new Set<InventoryTab>(["storeIssue", "plumberBalance", "plumberConsumption"]);

const MONTH_FILTER_EXCLUDED_TABS = new Set<InventoryTab>(["stock", "plumberBalance"]);

const TAB_TO_TRANSACTION_TYPE: Partial<Record<InventoryTab, MaterialTransactionType>> = {
  purchase: "purchase",
  pbgIssue: "pbg_issue",
  pbgConsumption: "pbg_consumption",
  storeIssue: "issue",
  totalIssue: "issue",
  plumberConsumption: "consumption",
};

const TAB_ACTION_TYPE: Partial<Record<InventoryTab, MaterialTransactionType>> = {
  purchase: "purchase",
  pbgIssue: "pbg_issue",
  pbgConsumption: "pbg_consumption",
  storeIssue: "issue",
  plumberBalance: "adjustment",
  plumberConsumption: "consumption",
};

type TotalIssueRow = {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  totalIssued: number;
  transactionCount: number;
  lastIssueDate: string;
};

type PlumberBalanceRow = PlumberBalance & { id: string; plumberName: string; materialName: string };

export function InventoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InventoryTab>("stock");
  const [filters, setFilters] = useState<InventoryFilterState>(EMPTY_INVENTORY_FILTERS);
  const { data: materials = [], isLoading: materialsLoading } = useMaterialsQuery();
  const { data: plumbers = [] } = usePlumbersQuery();
  const { data: customers = [] } = useCustomersQuery();
  const { data: projects = [] } = useProjectsQuery();

  const transactionType = TAB_TO_TRANSACTION_TYPE[activeTab];
  const showPlumberFilter = PLUMBER_FILTER_TABS.has(activeTab);
  const effectivePlumberId = showPlumberFilter ? filters.plumberId || undefined : undefined;
  const { from, to } = useMemo(() => inventoryFiltersToDateRange(filters.month), [filters.month]);
  const sourceFilter = filters.source || undefined;
  const projectFilter = filters.projectId || undefined;

  const downloadStockSheet = useDownloadInventoryStockSheet();
  const downloadPurchaseRegister = useDownloadInventoryPurchaseRegister();
  const downloadPbgIssue = useDownloadInventoryPbgIssue();
  const downloadStoreIssueBook = useDownloadInventoryStoreIssueBook();
  const downloadConsumptionLog = useDownloadInventoryConsumptionLog();
  const downloadPbgConsumption = useDownloadInventoryPbgConsumption();
  const downloadTotalIssue = useDownloadInventoryTotalIssue();
  const downloadPlumberBalance = useDownloadInventoryPlumberBalance();
  const isExportPending =
    downloadStockSheet.isPending ||
    downloadPurchaseRegister.isPending ||
    downloadPbgIssue.isPending ||
    downloadStoreIssueBook.isPending ||
    downloadConsumptionLog.isPending ||
    downloadPbgConsumption.isPending ||
    downloadTotalIssue.isPending ||
    downloadPlumberBalance.isPending;

  const { data: plumberBalances = [], isLoading: plumberBalancesLoading } = usePlumberBalancesQuery({
    source: sourceFilter,
    projectId: projectFilter,
    plumberId: effectivePlumberId,
  });
  const stockFiltered = Boolean(sourceFilter || projectFilter);
  const { data: stockBalances = [] } = useStockBalancesQuery(
    { source: sourceFilter, projectId: projectFilter },
    stockFiltered,
  );
  const stockBalanceByMaterialId = useMemo(
    () => new Map(stockBalances.map((row) => [row.materialId, row.balance])),
    [stockBalances],
  );

  const { data: purchaseTransactions = [], isLoading: purchaseLoading } = useMaterialTransactionsQuery({
    type: "purchase",
    source: sourceFilter,
    projectId: projectFilter,
    from,
    to,
  });
  const { data: pbgIssueTransactions = [], isLoading: pbgIssueLoading } = useMaterialTransactionsQuery({
    type: "pbg_issue",
    source: sourceFilter,
    projectId: projectFilter,
    from,
    to,
  });
  const { data: pbgConsumptionTransactions = [], isLoading: pbgConsumptionLoading } = useMaterialTransactionsQuery({
    type: "pbg_consumption",
    source: sourceFilter,
    projectId: projectFilter,
    plumberId: effectivePlumberId,
    from,
    to,
  });
  const { data: issueTransactions = [], isLoading: issueLoading } = useMaterialTransactionsQuery({
    type: "issue",
    source: sourceFilter,
    projectId: projectFilter,
    plumberId: effectivePlumberId,
    from,
    to,
  });
  const { data: consumptionTransactions = [], isLoading: consumptionLoading } = useMaterialTransactionsQuery({
    type: "consumption",
    source: sourceFilter,
    projectId: projectFilter,
    plumberId: effectivePlumberId,
    from,
    to,
  });

  const transactionsByType: Partial<Record<MaterialTransactionType, { data: MaterialTransaction[]; isLoading: boolean }>> = {
    purchase: { data: purchaseTransactions, isLoading: purchaseLoading },
    pbg_issue: { data: pbgIssueTransactions, isLoading: pbgIssueLoading },
    pbg_consumption: { data: pbgConsumptionTransactions, isLoading: pbgConsumptionLoading },
    issue: { data: issueTransactions, isLoading: issueLoading },
    consumption: { data: consumptionTransactions, isLoading: consumptionLoading },
  };

  const activeTransactions = transactionType ? transactionsByType[transactionType]?.data ?? [] : [];
  const transactionsLoading = transactionType ? transactionsByType[transactionType]?.isLoading ?? false : false;

  const materialNameById = useMemo(() => new Map(materials.map((m) => [m.id, m])), [materials]);
  const plumberNameById = useMemo(() => new Map(plumbers.map((p) => [p.id, p.name])), [plumbers]);
  const projectNameById = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);
  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, { name: c.customerConnection.customerName, bpNo: c.customerConnection.trBpNo }])),
    [customers],
  );
  const totalIssueRows = useMemo<TotalIssueRow[]>(() => {
    const grouped = new Map<string, TotalIssueRow>();
    for (const row of issueTransactions) {
      const material = materialNameById.get(row.materialId);
      const existing = grouped.get(row.materialId);
      if (existing) {
        existing.totalIssued += row.quantity;
        existing.transactionCount += 1;
        if (row.transactionDate > existing.lastIssueDate) existing.lastIssueDate = row.transactionDate;
      } else {
        grouped.set(row.materialId, {
          id: row.materialId,
          materialId: row.materialId,
          materialName: material?.name ?? "Unknown material",
          unit: material?.unit ?? "",
          totalIssued: row.quantity,
          transactionCount: 1,
          lastIssueDate: row.transactionDate,
        });
      }
    }
    return Array.from(grouped.values()).sort((a, b) => b.totalIssued - a.totalIssued);
  }, [issueTransactions, materialNameById]);

  const consumptionLogRows = useMemo(
    () =>
      [...consumptionTransactions, ...pbgConsumptionTransactions].sort((a, b) =>
        b.transactionDate.localeCompare(a.transactionDate),
      ),
    [consumptionTransactions, pbgConsumptionTransactions],
  );

  const plumberBalanceRows = useMemo<PlumberBalanceRow[]>(
    () =>
      plumberBalances.map((row) => ({
        ...row,
        id: `${row.plumberId}-${row.materialId}-${row.source || "unspecified"}-${row.projectId || "none"}`,
        plumberName: plumberNameById.get(row.plumberId) ?? "Unknown plumber",
        materialName: materialNameById.get(row.materialId)?.name ?? "Unknown material",
      })),
    [plumberBalances, plumberNameById, materialNameById],
  );

  const counts: Partial<Record<InventoryTab, number>> = {
    stock: materials.length,
    purchase: purchaseTransactions.length,
    pbgIssue: pbgIssueTransactions.length,
    pbgConsumption: pbgConsumptionTransactions.length,
    storeIssue: issueTransactions.length,
    totalIssue: totalIssueRows.length,
    plumberBalance: plumberBalanceRows.length,
    plumberConsumption: consumptionLogRows.length,
  };

  const stockColumns: ExcelColumn<Material>[] = [
    {
      key: "name",
      label: "Item Name",
      width: 230,
      sticky: true,
      grow: true,
      getValue: (row) => row.name,
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    { key: "category", label: "Category", width: 150, grow: true, getValue: (row) => row.category },
    { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
    {
      key: "currentBalance",
      label: stockFiltered ? "Balance (Filtered)" : "Current Balance",
      width: 160,
      getValue: (row) => (stockFiltered ? stockBalanceByMaterialId.get(row.id) ?? 0 : row.currentBalance),
    },
    { key: "reorderLevel", label: "Reorder Level", width: 140, getValue: (row) => row.reorderLevel },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => (stockFiltered ? computeStockStatus(stockBalanceByMaterialId.get(row.id) ?? 0, row.reorderLevel) : row.status),
      render: (row) => (
        <StatusBadge status={stockFiltered ? computeStockStatus(stockBalanceByMaterialId.get(row.id) ?? 0, row.reorderLevel) : row.status} />
      ),
    },
  ];

  const transactionColumns = (kind: MaterialTransactionType): ExcelColumn<MaterialTransaction>[] => {
    const base: ExcelColumn<MaterialTransaction>[] = [
      {
        key: "material",
        label: "Item Name",
        width: 220,
        sticky: true,
        grow: true,
        getValue: (row) => materialNameById.get(row.materialId)?.name ?? "-",
        render: (row) => (
          <span className="font-semibold text-foreground">{materialNameById.get(row.materialId)?.name ?? "-"}</span>
        ),
      },
      { key: "referenceNo", label: "Reference No.", width: 150, getValue: (row) => row.referenceNo },
      { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
      {
        key: "transactionDate",
        label: "Date",
        width: 130,
        getValue: (row) => row.transactionDate,
        render: (row) => formatDate(row.transactionDate),
      },
    ];

    let specific: ExcelColumn<MaterialTransaction>[] = [];
    if (kind === "purchase") {
      specific = [
        { key: "rate", label: "Rate", width: 110, getValue: (row) => row.rate ?? "-" },
        { key: "billAmount", label: "Bill Amount", width: 140, getValue: (row) => row.billAmount ?? "-" },
        { key: "vendorName", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
      ];
    } else if (kind === "pbg_issue") {
      specific = [
        { key: "vendorName", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
        { key: "vehicleNo", label: "Vehicle No.", width: 140, getValue: (row) => row.vehicleNo },
        { key: "vehicleQty", label: "Vehicle Qty", width: 120, getValue: (row) => row.vehicleQty ?? "-" },
        { key: "supervisorName", label: "Person", width: 150, getValue: (row) => row.supervisorName },
      ];
    } else if (kind === "pbg_consumption") {
      specific = [
        { key: "customer", label: "Customer", width: 190, getValue: (row) => customerNameById.get(row.customerId)?.name ?? "-" },
        { key: "plumber", label: "Plumber", width: 150, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
        { key: "project", label: "Project", width: 180, getValue: (row) => projectLabel(row.projectId, projectNameById) },
        { key: "vendorName", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
      ];
    } else if (kind === "issue") {
      specific = [
        { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
        { key: "plumber", label: "Plumber / Team", width: 170, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
        { key: "supervisorName", label: "Supervisor", width: 150, getValue: (row) => row.supervisorName },
        { key: "project", label: "Project", width: 180, getValue: (row) => projectLabel(row.projectId, projectNameById) },
        { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
      ];
    } else if (kind === "consumption") {
      specific = [
        { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
        {
          key: "customer",
          label: "Customer",
          width: 190,
          getValue: (row) => customerNameById.get(row.customerId)?.name ?? "-",
        },
        { key: "project", label: "Project", width: 180, getValue: (row) => projectLabel(row.projectId, projectNameById) },
        { key: "reportNo", label: "Report No.", width: 140, getValue: (row) => row.reportNo },
        { key: "plumber", label: "Plumber", width: 150, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
        { key: "supervisorName", label: "Supervisor", width: 150, getValue: (row) => row.supervisorName },
        { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
      ];
    }

    const actionsColumn: ExcelColumn<MaterialTransaction> = {
      key: "actions",
      label: "Actions",
      width: 140,
      getValue: () => "",
      render: (row) => (
        <TransactionRowActions
          transaction={row}
          lookups={{
            materialName: materialNameById.get(row.materialId)?.name ?? "-",
            plumberName: plumberNameById.get(row.plumberId),
            supervisorName: row.supervisorName,
            customerName: customerNameById.get(row.customerId)?.name,
            projectName: projectNameById.get(row.projectId),
          }}
        />
      ),
    };

    return [...base, ...specific, actionsColumn];
  };

  const totalIssueColumns: ExcelColumn<TotalIssueRow>[] = [
    {
      key: "materialName",
      label: "Item Name",
      width: 240,
      sticky: true,
      grow: true,
      getValue: (row) => row.materialName,
      render: (row) => <span className="font-semibold text-foreground">{row.materialName}</span>,
    },
    { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
    { key: "totalIssued", label: "Total Issued", width: 150, getValue: (row) => row.totalIssued },
    { key: "transactionCount", label: "Issue Slips", width: 130, getValue: (row) => row.transactionCount },
    {
      key: "lastIssueDate",
      label: "Last Issue Date",
      width: 160,
      getValue: (row) => row.lastIssueDate,
      render: (row) => formatDate(row.lastIssueDate),
    },
  ];

  const plumberBalanceColumns: ExcelColumn<PlumberBalanceRow>[] = [
    {
      key: "plumberName",
      label: "Plumber / Team",
      width: 180,
      sticky: true,
      grow: true,
      getValue: (row) => row.plumberName,
      render: (row) => <span className="font-semibold text-foreground">{row.plumberName}</span>,
    },
    { key: "materialName", label: "Material", width: 210, grow: true, getValue: (row) => row.materialName },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabel(row.projectId, projectNameById) },
    { key: "issued", label: "Total Issued", width: 140, getValue: (row) => row.issued },
    { key: "consumed", label: "Consumed", width: 130, getValue: (row) => row.consumed },
    { key: "returned", label: "Returned", width: 130, getValue: (row) => row.returned },
    { key: "adjusted", label: "Adjusted", width: 120, getValue: (row) => row.adjusted },
    {
      key: "balance",
      label: "Balance With Plumber",
      width: 190,
      getValue: (row) => row.balance,
      render: (row) => <b>{row.balance}</b>,
    },
  ];

  function handleExport() {
    if (activeTab === "stock") {
      void downloadStockSheet.mutateAsync({ projectId: projectFilter, source: sourceFilter });
    } else if (activeTab === "purchase") {
      void downloadPurchaseRegister.mutateAsync({ projectId: projectFilter, from, to });
    } else if (activeTab === "pbgIssue") {
      void downloadPbgIssue.mutateAsync({ projectId: projectFilter, from, to });
    } else if (activeTab === "pbgConsumption") {
      void downloadPbgConsumption.mutateAsync({ projectId: projectFilter, plumberId: effectivePlumberId, from, to });
    } else if (activeTab === "storeIssue") {
      void downloadStoreIssueBook.mutateAsync({ projectId: projectFilter, source: sourceFilter, plumberId: effectivePlumberId, from, to });
    } else if (activeTab === "totalIssue") {
      void downloadTotalIssue.mutateAsync({ projectId: projectFilter, source: sourceFilter, from, to });
    } else if (activeTab === "plumberBalance") {
      void downloadPlumberBalance.mutateAsync({ projectId: projectFilter, source: sourceFilter, plumberId: effectivePlumberId });
    } else if (activeTab === "plumberConsumption") {
      void downloadConsumptionLog.mutateAsync({ projectId: projectFilter, source: sourceFilter, plumberId: effectivePlumberId, from, to });
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory & Material"
        subtitle="Real-time stock, purchase, issue and plumber consumption ledger."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <InventoryFilterBar
              filters={filters}
              onChange={setFilters}
              projects={projects}
              plumbers={plumbers}
              showPlumberFilter={showPlumberFilter}
              showMonthFilter={!MONTH_FILTER_EXCLUDED_TABS.has(activeTab)}
            />

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
                <DropdownMenuItem onClick={handleExport} disabled={isExportPending}>
                  <DownloadSimpleIcon size={14} />
                  {isExportPending ? "Exporting..." : "Export Excel"}
                </DropdownMenuItem>
                {activeTab === "stock" ? (
                  <DropdownMenuItem onClick={() => router.push("/inventory/import")}>
                    <UploadSimpleIcon size={14} />
                    Import
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            {activeTab === "stock" ? (
              <>
                <MaterialCategoryDrawer />
                <MaterialItemDrawer />
              </>
            ) : TAB_ACTION_TYPE[activeTab] ? (
              <MaterialDrawer type={TAB_ACTION_TYPE[activeTab]} />
            ) : null}
          </div>
        }
      />
      <InventoryTabNav activeTab={activeTab} onChange={setActiveTab} counts={counts} />

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

      {activeTab === "purchase" ? (
        <ExcelDataGrid columns={transactionColumns("purchase")} rows={activeTransactions} emptyTitle="No purchase records found" isLoading={transactionsLoading} enableFullView />
      ) : null}

      {activeTab === "pbgIssue" ? (
        <ExcelDataGrid columns={transactionColumns("pbg_issue")} rows={activeTransactions} emptyTitle="No PBG issue records found" isLoading={transactionsLoading} enableFullView />
      ) : null}

      {activeTab === "pbgConsumption" ? (
        <ExcelDataGrid
          columns={transactionColumns("pbg_consumption")}
          rows={activeTransactions}
          emptyTitle="No PBG consumption records found"
          isLoading={transactionsLoading}
          enableFullView
        />
      ) : null}

      {activeTab === "storeIssue" ? (
        <ExcelDataGrid columns={transactionColumns("issue")} rows={activeTransactions} emptyTitle="No store issue records found" isLoading={transactionsLoading} enableFullView />
      ) : null}

      {activeTab === "totalIssue" ? (
        <ExcelDataGrid columns={totalIssueColumns} rows={totalIssueRows} emptyTitle="No issued materials found" isLoading={transactionsLoading} enableFullView />
      ) : null}

      {activeTab === "plumberBalance" ? (
        <ExcelDataGrid
          columns={plumberBalanceColumns}
          rows={plumberBalanceRows}
          emptyTitle="No plumber balance records found"
          isLoading={plumberBalancesLoading}
          enableFullView
        />
      ) : null}

      {activeTab === "plumberConsumption" ? (
        <ExcelDataGrid
          columns={transactionColumns("consumption")}
          rows={consumptionLogRows}
          emptyTitle="No consumption records found"
          isLoading={consumptionLoading || pbgConsumptionLoading}
          enableFullView
        />
      ) : null}
    </div>
  );
}
