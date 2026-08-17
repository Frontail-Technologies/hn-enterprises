"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { buttonVariants } from "@/components/ui/button";
import { exportRowsToExcel } from "@/lib/export-excel";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { formatDate, projectLabel, sourceLabel } from "../utils/format";
import { useMaterialQuery, useMaterialTransactionsQuery, usePlumberBalancesQuery } from "../hooks/useMaterials";
import type { MaterialTransaction } from "../types/material.types";
import { InventoryActions } from "./inventory/InventoryActions";
import { StockStatus } from "./inventory/StockStatus";
import { TransactionRowActions } from "./inventory/TransactionRowActions";
import { PageLoading } from "@/components/shared/PageLoading";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";

type DetailTab = "purchase" | "storeIssue" | "consumption" | "plumberLedger" | "transactions";

const detailTabs: { id: DetailTab; label: string }[] = [
  { id: "purchase", label: "Purchase / PBG Received" },
  { id: "storeIssue", label: "Store Issue Book" },
  { id: "consumption", label: "Customer / BP Consumption" },
  { id: "plumberLedger", label: "Plumber Ledger" },
  { id: "transactions", label: "Transaction History" },
];

export function InventoryDetailPage({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("purchase");
  const { data: material, isLoading, isError } = useMaterialQuery(id);
  const { data: transactions = [], isLoading: transactionsLoading } = useMaterialTransactionsQuery({ materialId: id });
  const { data: plumberBalances = [], isLoading: plumberBalancesLoading } = usePlumberBalancesQuery({ materialId: id });
  const { data: plumbers = [], isLoading: plumbersLoading } = usePlumbersQuery();
  const { data: customers = [], isLoading: customersLoading } = useCustomersQuery();
  const { data: projects = [] } = useProjectsQuery();
  // Replaces the layout's generic (raw-UUID) breadcrumb segment with the
  // material name instead of rendering a second breadcrumb on this page.
  useBreadcrumbLabel(material?.name);

  const plumberNameById = useMemo(() => new Map(plumbers.map((p) => [p.id, p.name])), [plumbers]);
  const projectNameById = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);
  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.customerConnection.customerName])),
    [customers],
  );
  const purchases = useMemo(
    () => transactions.filter((row) => row.type === "purchase" || row.type === "pbg_issue"),
    [transactions],
  );
  const storeIssues = useMemo(() => transactions.filter((row) => row.type === "issue"), [transactions]);
  // Consumption covers both purchase-sourced and PBG-attributed consumption (§1) - the
  // main Inventory module's Consumption Log likewise merges `consumption` +
  // `pbg_consumption`, and this page must show the same truth.
  const consumption = useMemo(
    () => transactions.filter((row) => row.type === "consumption" || row.type === "pbg_consumption"),
    [transactions],
  );

  const receivedQty = purchases.reduce((sum, row) => sum + row.quantity, 0);
  const issuedQty = storeIssues.reduce((sum, row) => sum + row.quantity, 0);
  const consumedQty = consumption.reduce((sum, row) => sum + row.quantity, 0);
  const returnedQty = transactions
    .filter((row) => row.type === "return")
    .reduce((sum, row) => sum + row.quantity, 0);

  const plumberLedgerRows = useMemo(
    () =>
      plumberBalances.map((row) => ({
        ...row,
        // A plumber can hold multiple balances of this material split by source and
        // project (§1) - plumberId alone collides across those rows.
        id: `${row.plumberId}-${row.source || "unspecified"}-${row.projectId || "none"}`,
        plumberName: plumberNameById.get(row.plumberId) ?? "Unknown plumber",
      })),
    [plumberBalances, plumberNameById],
  );

  const transactionGridLoading = transactionsLoading || plumbersLoading || customersLoading;

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !material) {
    return <p className="p-4 text-sm text-destructive">Unable to load this material.</p>;
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
          materialName: material.name,
          plumberName: plumberNameById.get(row.plumberId),
          supervisorName: row.supervisorName,
          customerName: customerNameById.get(row.customerId),
          projectName: projectNameById.get(row.projectId),
        }}
      />
    ),
  };

  const purchaseColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "type", label: "Type", width: 130, sticky: true, getValue: (row) => (row.type === "pbg_issue" ? "PBG Issue" : "Purchase") },
    { key: "vendor", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
    { key: "rate", label: "Rate", width: 110, getValue: (row) => row.rate ?? "-" },
    { key: "billAmount", label: "Bill Amount", width: 140, getValue: (row) => row.billAmount ?? "-" },
    { key: "referenceNo", label: "Reference No.", width: 150, getValue: (row) => row.referenceNo },
    actionsColumn,
  ];

  const storeIssueColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "slipNo", label: "Slip No.", width: 130, sticky: true, getValue: (row) => row.referenceNo },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "plumber", label: "Plumber / Team", width: 170, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
    { key: "supervisorName", label: "Supervisor", width: 150, getValue: (row) => row.supervisorName },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabel(row.projectId, projectNameById) },
    { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
    actionsColumn,
  ];

  const transactionColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "type", label: "Type", width: 150, sticky: true, getValue: (row) => row.type },
    { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "plumber", label: "Plumber", width: 160, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
    { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
    { key: "customer", label: "Customer", width: 190, getValue: (row) => customerNameById.get(row.customerId) ?? "-" },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabel(row.projectId, projectNameById) },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    { key: "remarks", label: "Remarks", width: 260, getValue: (row) => row.remarks },
    actionsColumn,
  ];

  const consumptionColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "customer", label: "Customer", width: 190, sticky: true, getValue: (row) => customerNameById.get(row.customerId) ?? "-" },
    { key: "usedQty", label: "Used Qty", width: 120, getValue: (row) => row.quantity },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabel(row.projectId, projectNameById) },
    { key: "plumber", label: "Plumber", width: 150, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
    { key: "supervisorName", label: "Supervisor", width: 160, getValue: (row) => row.supervisorName },
    { key: "reportNo", label: "Report No.", width: 140, getValue: (row) => row.reportNo },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    actionsColumn,
  ];

  const plumberBalanceColumns: ExcelColumn<(typeof plumberLedgerRows)[number]>[] = [
    { key: "plumberName", label: "Plumber / Team", width: 170, sticky: true, getValue: (row) => row.plumberName },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabel(row.projectId, projectNameById) },
    { key: "issued", label: "Total Issued", width: 130, getValue: (row) => row.issued },
    { key: "consumed", label: "Consumed", width: 120, getValue: (row) => row.consumed },
    { key: "returned", label: "Returned", width: 120, getValue: (row) => row.returned },
    { key: "adjusted", label: "Adjusted", width: 120, getValue: (row) => row.adjusted },
    { key: "balance", label: "Balance", width: 120, getValue: (row) => row.balance },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={material.name}
        subtitle={`${material.category || "Uncategorised"} / ${material.unit}`}
        actions={
          <>
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "default" })}
              onClick={() => void exportRowsToExcel(`${material.name}-transactions.xlsx`, transactionColumns, transactions)}
            >
              <DownloadSimpleIcon size={15} />
              Export Excel
            </button>
            <InventoryActions material={material} />
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-card border border-border bg-card sm:grid-cols-5 sm:divide-y-0">
          {[
            { label: "Available", value: `${material.currentBalance} ${material.unit}` },
            { label: "Received", value: receivedQty || 0 },
            { label: "Issued", value: issuedQty || 0 },
            { label: "Consumed", value: consumedQty || 0 },
            { label: "Returned", value: returnedQty || 0 },
          ].map((stat) => (
            <div key={stat.label} className="px-3.5 py-2.5">
              <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-base font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-card border border-border bg-card px-3.5 py-2.5 text-xs">
          <StockStatus row={material} />
          <span className="text-muted-foreground">
            Unit: <b className="font-semibold text-foreground">{material.unit}</b>
          </span>
          <span className="text-muted-foreground">
            Reorder Level: <b className="font-semibold text-foreground">{material.reorderLevel}</b>
          </span>
          <span className="text-muted-foreground">
            Plumber Balances: <b className="font-semibold text-foreground">{plumberLedgerRows.length}</b>
          </span>
        </div>
      </section>

      <div className="space-y-3">
        <UnderlineTabs items={detailTabs} active={activeTab} onChange={(tab) => setActiveTab(tab as DetailTab)} />

        {activeTab === "purchase" ? (
          <ExcelDataGrid
            columns={purchaseColumns}
            rows={purchases}
            maxHeightClassName="max-h-[50vh]"
            emptyTitle="No purchase rows found"
            isLoading={transactionsLoading}
          />
        ) : null}

        {activeTab === "storeIssue" ? (
          <ExcelDataGrid
            columns={storeIssueColumns}
            rows={storeIssues}
            maxHeightClassName="max-h-[50vh]"
            emptyTitle="No issue rows found"
            isLoading={transactionsLoading || plumbersLoading}
          />
        ) : null}

        {activeTab === "consumption" ? (
          <ExcelDataGrid
            columns={consumptionColumns}
            rows={consumption}
            maxHeightClassName="max-h-[50vh]"
            emptyTitle="No customer consumption found for this material"
            isLoading={transactionGridLoading}
          />
        ) : null}

        {activeTab === "plumberLedger" ? (
          <ExcelDataGrid
            columns={plumberBalanceColumns}
            rows={plumberLedgerRows}
            maxHeightClassName="max-h-[50vh]"
            emptyTitle="No plumber balance for this material"
            isLoading={plumberBalancesLoading || plumbersLoading}
          />
        ) : null}

        {activeTab === "transactions" ? (
          <ExcelDataGrid
            columns={transactionColumns}
            rows={transactions}
            maxHeightClassName="max-h-[50vh]"
            emptyTitle="No transactions found"
            isLoading={transactionGridLoading}
          />
        ) : null}
      </div>
    </div>
  );
}
