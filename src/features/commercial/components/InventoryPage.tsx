"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { ImportDialog } from "@/components/shared/ImportDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exportRowsToExcel } from "@/lib/export-excel";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import type { InventoryTab } from "../types/commercial.types";
import type { Material, MaterialTransaction, MaterialTransactionType, PlumberBalance } from "../types/material.types";
import { formatDate } from "../utils/format";
import { useMaterialsQuery, useMaterialTransactionsQuery, usePlumberBalancesQuery } from "../hooks/useMaterials";
import { useMaterialsImportPreview, useMaterialsImportConfirm } from "../hooks/useMaterialsImport";
import type { MaterialImportRow } from "../services/materials-import.service";
import { InventoryTabNav } from "./inventory/InventoryTabNav";
import { MaterialDrawer } from "./inventory/MaterialDrawer";
import { MaterialItemDrawer } from "./inventory/MaterialItemDrawer";
import { MaterialCategoryDrawer } from "./inventory/MaterialCategoryDrawer";

const TAB_TO_TRANSACTION_TYPE: Partial<Record<InventoryTab, MaterialTransactionType>> = {
  purchase: "purchase",
  pbgIssue: "pbg_issue",
  pbgConsumption: "pbg_consumption",
  storeIssue: "issue",
  totalIssue: "issue",
  plumberConsumption: "consumption",
};

const TAB_ACTION_TYPE: Record<InventoryTab, MaterialTransactionType> = {
  stock: "purchase",
  purchase: "purchase",
  pbgIssue: "pbg_issue",
  pbgConsumption: "pbg_consumption",
  storeIssue: "issue",
  totalIssue: "issue",
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

const importPreviewColumns: ExcelColumn<MaterialImportRow & { id: string }>[] = [
  { key: "name", label: "Name", width: 220, getValue: (r) => r.name },
  { key: "category", label: "Category", width: 160, getValue: (r) => r.category },
  { key: "unit", label: "Unit", width: 100, getValue: (r) => r.unit },
  { key: "reorderLevel", label: "Reorder Level", width: 140, getValue: (r) => r.reorderLevel },
  {
    key: "status",
    label: "Status",
    width: 120,
    getValue: (r) => (r.error ? "invalid" : "valid"),
    render: (r) => <StatusBadge status={r.error ? "Rejected" : "Approved"} />,
  },
  { key: "error", label: "Error", width: 260, getValue: (r) => r.error || "-" },
];

export function InventoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InventoryTab>("stock");
  const { data: materials = [], isLoading: materialsLoading } = useMaterialsQuery();
  const { data: plumbers = [] } = usePlumbersQuery();
  const importPreview = useMaterialsImportPreview();
  const importConfirm = useMaterialsImportConfirm();
  const { data: customers = [] } = useCustomersQuery();
  const { data: plumberBalances = [], isLoading: plumberBalancesLoading } = usePlumberBalancesQuery();

  const transactionType = TAB_TO_TRANSACTION_TYPE[activeTab];

  // Fetched unconditionally (not gated to the active tab) so every tab's
  // count badge is right from the first render instead of only appearing
  // once that tab has been clicked.
  const { data: purchaseTransactions = [], isLoading: purchaseLoading } = useMaterialTransactionsQuery({ type: "purchase" });
  const { data: pbgIssueTransactions = [], isLoading: pbgIssueLoading } = useMaterialTransactionsQuery({ type: "pbg_issue" });
  const { data: pbgConsumptionTransactions = [], isLoading: pbgConsumptionLoading } = useMaterialTransactionsQuery({
    type: "pbg_consumption",
  });
  const { data: issueTransactions = [], isLoading: issueLoading } = useMaterialTransactionsQuery({ type: "issue" });
  const { data: consumptionTransactions = [], isLoading: consumptionLoading } = useMaterialTransactionsQuery({
    type: "consumption",
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

  const plumberBalanceRows = useMemo<PlumberBalanceRow[]>(
    () =>
      plumberBalances.map((row) => ({
        ...row,
        id: `${row.plumberId}-${row.materialId}`,
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
    plumberConsumption: consumptionTransactions.length,
  };

  const stockColumns: ExcelColumn<Material>[] = [
    {
      key: "name",
      label: "Item Name",
      width: 230,
      sticky: true,
      getValue: (row) => row.name,
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    { key: "category", label: "Category", width: 150, getValue: (row) => row.category },
    { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
    { key: "currentBalance", label: "Current Balance", width: 150, getValue: (row) => row.currentBalance },
    { key: "reorderLevel", label: "Reorder Level", width: 140, getValue: (row) => row.reorderLevel },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const transactionColumns = (kind: MaterialTransactionType): ExcelColumn<MaterialTransaction>[] => {
    const base: ExcelColumn<MaterialTransaction>[] = [
      {
        key: "material",
        label: "Item Name",
        width: 220,
        sticky: true,
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

    if (kind === "purchase") {
      return [
        ...base,
        { key: "rate", label: "Rate", width: 110, getValue: (row) => row.rate ?? "-" },
        { key: "billAmount", label: "Bill Amount", width: 140, getValue: (row) => row.billAmount ?? "-" },
        { key: "vendorName", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
      ];
    }
    if (kind === "pbg_issue") {
      return [
        ...base,
        { key: "vendorName", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
        { key: "vehicleNo", label: "Vehicle No.", width: 140, getValue: (row) => row.vehicleNo },
        { key: "vehicleQty", label: "Vehicle Qty", width: 120, getValue: (row) => row.vehicleQty ?? "-" },
        { key: "supervisorName", label: "Person", width: 150, getValue: (row) => row.supervisorName },
      ];
    }
    if (kind === "pbg_consumption") {
      return [...base, { key: "vendorName", label: "Vendor", width: 170, getValue: (row) => row.vendorName }];
    }
    if (kind === "issue") {
      return [
        ...base,
        { key: "plumber", label: "Plumber / Team", width: 170, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
        { key: "supervisorName", label: "Supervisor", width: 150, getValue: (row) => row.supervisorName },
        { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
      ];
    }
    if (kind === "consumption") {
      return [
        ...base,
        {
          key: "customer",
          label: "Customer",
          width: 190,
          getValue: (row) => customerNameById.get(row.customerId)?.name ?? "-",
        },
        { key: "reportNo", label: "Report No.", width: 140, getValue: (row) => row.reportNo },
        { key: "plumber", label: "Plumber", width: 150, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
        { key: "supervisorName", label: "Supervisor", width: 150, getValue: (row) => row.supervisorName },
        { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
      ];
    }
    return base;
  };

  const totalIssueColumns: ExcelColumn<TotalIssueRow>[] = [
    {
      key: "materialName",
      label: "Item Name",
      width: 240,
      sticky: true,
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
      getValue: (row) => row.plumberName,
      render: (row) => <span className="font-semibold text-foreground">{row.plumberName}</span>,
    },
    { key: "materialName", label: "Material", width: 210, getValue: (row) => row.materialName },
    { key: "issued", label: "Total Issued", width: 140, getValue: (row) => row.issued },
    { key: "consumed", label: "Consumed", width: 130, getValue: (row) => row.consumed },
    { key: "returned", label: "Returned", width: 130, getValue: (row) => row.returned },
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
      void exportRowsToExcel("materials-stock.xlsx", stockColumns, materials);
    } else if (activeTab === "totalIssue") {
      void exportRowsToExcel("total-issue.xlsx", totalIssueColumns, totalIssueRows);
    } else if (activeTab === "plumberBalance") {
      void exportRowsToExcel("plumber-balance.xlsx", plumberBalanceColumns, plumberBalanceRows);
    } else if (transactionType) {
      void exportRowsToExcel(`${activeTab}.xlsx`, transactionColumns(transactionType), activeTransactions);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory & Material"
        subtitle="Real-time stock, purchase, issue and plumber consumption ledger."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={buttonVariants({ variant: "outline", size: "default" })} onClick={handleExport}>
              <DownloadSimpleIcon size={15} />
              Export Excel
            </button>
            <MaterialCategoryDrawer />
            {activeTab === "stock" ? (
              <ImportDialog
                trigger={
                  <Button type="button" variant="outline">
                    <UploadSimpleIcon size={15} />
                    Import
                  </Button>
                }
                title="Import Materials"
                description="Upload an Excel file to bulk import catalog items."
                templateFileName="materials_template.xlsx"
                templateHeaders={["Name", "Category", "Unit", "Reorder Level"]}
                previewColumns={importPreviewColumns}
                isPreviewPending={importPreview.isPending}
                isConfirmPending={importConfirm.isPending}
                entityLabelPlural="Materials"
                onPreview={(file) => importPreview.mutateAsync(file)}
                onConfirm={(validRows) => importConfirm.mutateAsync(validRows)}
              />
            ) : null}
            <MaterialItemDrawer />
            <MaterialDrawer type={TAB_ACTION_TYPE[activeTab]} />
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
        />
      ) : null}

      {activeTab === "purchase" ? (
        <ExcelDataGrid columns={transactionColumns("purchase")} rows={activeTransactions} emptyTitle="No purchase records found" isLoading={transactionsLoading} />
      ) : null}

      {activeTab === "pbgIssue" ? (
        <ExcelDataGrid columns={transactionColumns("pbg_issue")} rows={activeTransactions} emptyTitle="No PBG issue records found" isLoading={transactionsLoading} />
      ) : null}

      {activeTab === "pbgConsumption" ? (
        <ExcelDataGrid
          columns={transactionColumns("pbg_consumption")}
          rows={activeTransactions}
          emptyTitle="No PBG consumption records found"
          isLoading={transactionsLoading}
        />
      ) : null}

      {activeTab === "storeIssue" ? (
        <ExcelDataGrid columns={transactionColumns("issue")} rows={activeTransactions} emptyTitle="No store issue records found" isLoading={transactionsLoading} />
      ) : null}

      {activeTab === "totalIssue" ? (
        <ExcelDataGrid columns={totalIssueColumns} rows={totalIssueRows} emptyTitle="No issued materials found" isLoading={transactionsLoading} />
      ) : null}

      {activeTab === "plumberBalance" ? (
        <ExcelDataGrid
          columns={plumberBalanceColumns}
          rows={plumberBalanceRows}
          emptyTitle="No plumber balance records found"
          isLoading={plumberBalancesLoading}
        />
      ) : null}

      {activeTab === "plumberConsumption" ? (
        <ExcelDataGrid
          columns={transactionColumns("consumption")}
          rows={activeTransactions}
          emptyTitle="No consumption records found"
          isLoading={transactionsLoading}
        />
      ) : null}
    </div>
  );
}
