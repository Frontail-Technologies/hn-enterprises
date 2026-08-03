"use client";

import { useMemo } from "react";
import { DownloadSimpleIcon, PackageIcon, ReceiptIcon, UserIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { buttonVariants } from "@/components/ui/button";
import { exportRowsToExcel } from "@/lib/export-excel";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { formatDate } from "../utils/format";
import { useAllProjectSitesQuery } from "../hooks/useAllProjectSites";
import { useMaterialQuery, useMaterialTransactionsQuery, usePlumberBalancesQuery } from "../hooks/useMaterials";
import type { MaterialTransaction } from "../types/material.types";
import { InventoryActions } from "./inventory/InventoryActions";
import { StockStatus } from "./inventory/StockStatus";
import { CommercialBreadcrumb } from "./shared/CommercialBreadcrumb";
import { PageLoading } from "@/components/shared/PageLoading";

export function InventoryDetailPage({ id }: { id: string }) {
  const { data: material, isLoading, isError } = useMaterialQuery(id);
  const { data: transactions = [], isLoading: transactionsLoading } = useMaterialTransactionsQuery({ materialId: id });
  const { data: plumberBalances = [], isLoading: plumberBalancesLoading } = usePlumberBalancesQuery({ materialId: id });
  const { data: plumbers = [], isLoading: plumbersLoading } = usePlumbersQuery();
  const { data: customers = [], isLoading: customersLoading } = useCustomersQuery();
  const { data: sites = [], isLoading: sitesLoading } = useAllProjectSitesQuery();

  const plumberNameById = useMemo(() => new Map(plumbers.map((p) => [p.id, p.name])), [plumbers]);
  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.customerConnection.customerName])),
    [customers],
  );
  const siteNameById = useMemo(() => new Map(sites.map((s) => [s.id, s.name])), [sites]);

  const purchases = useMemo(
    () => transactions.filter((row) => row.type === "purchase" || row.type === "pbg_issue"),
    [transactions],
  );
  const storeIssues = useMemo(() => transactions.filter((row) => row.type === "issue"), [transactions]);
  const consumption = useMemo(() => transactions.filter((row) => row.type === "consumption"), [transactions]);

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
        id: row.plumberId,
        plumberName: plumberNameById.get(row.plumberId) ?? "Unknown plumber",
      })),
    [plumberBalances, plumberNameById],
  );

  const transactionGridLoading = transactionsLoading || plumbersLoading || customersLoading || sitesLoading;

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !material) {
    return <p className="p-4 text-sm text-destructive">Unable to load this material.</p>;
  }

  const purchaseColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "type", label: "Type", width: 130, sticky: true, getValue: (row) => (row.type === "pbg_issue" ? "PBG Issue" : "Purchase") },
    { key: "vendor", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
    { key: "rate", label: "Rate", width: 110, getValue: (row) => row.rate ?? "-" },
    { key: "billAmount", label: "Bill Amount", width: 140, getValue: (row) => row.billAmount ?? "-" },
    { key: "referenceNo", label: "Reference No.", width: 150, getValue: (row) => row.referenceNo },
  ];

  const storeIssueColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "slipNo", label: "Slip No.", width: 130, sticky: true, getValue: (row) => row.referenceNo },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
    { key: "plumber", label: "Plumber / Team", width: 170, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
    { key: "site", label: "Site", width: 190, getValue: (row) => siteNameById.get(row.siteId) ?? "-" },
  ];

  const transactionColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "type", label: "Type", width: 150, sticky: true, getValue: (row) => row.type },
    { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
    { key: "plumber", label: "Plumber", width: 160, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
    { key: "site", label: "Site", width: 190, getValue: (row) => siteNameById.get(row.siteId) ?? "-" },
    { key: "customer", label: "Customer", width: 190, getValue: (row) => customerNameById.get(row.customerId) ?? "-" },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    { key: "remarks", label: "Remarks", width: 260, getValue: (row) => row.remarks },
  ];

  const consumptionColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "customer", label: "Customer", width: 190, sticky: true, getValue: (row) => customerNameById.get(row.customerId) ?? "-" },
    { key: "usedQty", label: "Used Qty", width: 120, getValue: (row) => row.quantity },
    { key: "plumber", label: "Plumber", width: 150, getValue: (row) => plumberNameById.get(row.plumberId) ?? "-" },
    { key: "supervisorName", label: "Supervisor", width: 160, getValue: (row) => row.supervisorName },
    { key: "reportNo", label: "Report No.", width: 140, getValue: (row) => row.reportNo },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
  ];

  const plumberBalanceColumns: ExcelColumn<(typeof plumberLedgerRows)[number]>[] = [
    { key: "plumberName", label: "Plumber / Team", width: 170, sticky: true, getValue: (row) => row.plumberName },
    { key: "issued", label: "Total Issued", width: 130, getValue: (row) => row.issued },
    { key: "consumed", label: "Consumed", width: 120, getValue: (row) => row.consumed },
    { key: "returned", label: "Returned", width: 120, getValue: (row) => row.returned },
    { key: "balance", label: "Balance", width: 120, getValue: (row) => row.balance },
  ];

  return (
    <div className="space-y-5">
      <CommercialBreadcrumb
        items={[
          { label: "Inventory & Material", href: "/inventory" },
          { label: material.name },
        ]}
      />
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
            <InventoryActions material={material} labels />
          </>
        }
      />

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.45fr)]">
        <SectionCard title="Material Summary">
          <KeyValueGrid
            columns={3}
            items={[
              { icon: <PackageIcon size={15} />, label: "Unit", value: material.unit },
              { icon: <PackageIcon size={15} />, label: "Available", value: `${material.currentBalance} ${material.unit}` },
              { icon: <PackageIcon size={15} />, label: "Received", value: receivedQty || "-" },
              { icon: <PackageIcon size={15} />, label: "Issued", value: issuedQty || "-" },
              { icon: <PackageIcon size={15} />, label: "Consumed", value: consumedQty || "-" },
              { icon: <PackageIcon size={15} />, label: "Returned", value: returnedQty || "-" },
            ]}
          />
        </SectionCard>
        <SectionCard title="Stock Status">
          <div className="space-y-3">
            <StockStatus row={material} />
            <KeyValueGrid
              compact
              items={[
                { icon: <PackageIcon size={15} />, label: "Reorder Level", value: material.reorderLevel },
                { icon: <ReceiptIcon size={15} />, label: "Purchase Rows", value: purchases.length },
                { icon: <UserIcon size={15} />, label: "Plumber Balances", value: plumberLedgerRows.length },
              ]}
            />
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Plumber Ledger">
        <ExcelDataGrid
          columns={plumberBalanceColumns}
          rows={plumberLedgerRows}
          maxHeightClassName="max-h-[34vh]"
          emptyTitle="No plumber balance for this material"
          isLoading={plumberBalancesLoading || plumbersLoading}
        />
      </SectionCard>

      <SectionCard title="Customer / BP Consumption">
        <ExcelDataGrid
          columns={consumptionColumns}
          rows={consumption}
          maxHeightClassName="max-h-[40vh]"
          emptyTitle="No customer consumption found for this material"
          isLoading={transactionGridLoading}
        />
      </SectionCard>

      <section className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Purchase / PBG Received">
          <ExcelDataGrid
            columns={purchaseColumns}
            rows={purchases}
            maxHeightClassName="max-h-[34vh]"
            emptyTitle="No purchase rows found"
            isLoading={transactionsLoading}
          />
        </SectionCard>
        <SectionCard title="Store Issue Book">
          <ExcelDataGrid
            columns={storeIssueColumns}
            rows={storeIssues}
            maxHeightClassName="max-h-[34vh]"
            emptyTitle="No issue rows found"
            isLoading={transactionsLoading || plumbersLoading || sitesLoading}
          />
        </SectionCard>
      </section>

      <SectionCard title="Transaction History">
        <ExcelDataGrid
          columns={transactionColumns}
          rows={transactions}
          maxHeightClassName="max-h-[34vh]"
          emptyTitle="No transactions found"
          isLoading={transactionGridLoading}
        />
      </SectionCard>
    </div>
  );
}
