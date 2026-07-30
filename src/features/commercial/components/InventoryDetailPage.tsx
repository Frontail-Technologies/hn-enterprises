"use client";

import { PackageIcon, ReceiptIcon, UserIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  getMaterial,
  getMaterialCustomerConsumption,
  getMaterialPbgIssues,
  getMaterialPlumberBalances,
  getMaterialPurchases,
  getMaterialStockRow,
  getMaterialStoreIssues,
  getMaterialTransactions,
} from "../utils/inventory.utils";
import { formatDate } from "../utils/format";
import { InventoryActions } from "./inventory/InventoryActions";
import { StockStatus } from "./inventory/StockStatus";
import { CommercialBreadcrumb } from "./shared/CommercialBreadcrumb";

export function InventoryDetailPage({ id }: { id: string }) {
  const material = getMaterial(id);
  const stock = getMaterialStockRow(material.id);
  const purchases = getMaterialPurchases(material.id);
  const pbgIssues = getMaterialPbgIssues(material.id);
  const storeIssues = getMaterialStoreIssues(material.id);
  const plumberBalances = getMaterialPlumberBalances(material.id);
  const customerConsumption = getMaterialCustomerConsumption(material.id);
  const transactions = getMaterialTransactions(material.id);
  const receivedQty =
    purchases.reduce((sum, row) => sum + Number(row.totalPurchaseQty || 0), 0) +
    pbgIssues.reduce((sum, row) => sum + Number(row.bgTotalIssueStore || 0), 0);
  const totalIssued =
    stock?.totalIssue ??
    storeIssues.reduce((sum, row) => sum + Number(row.totalIssue || 0), 0);
  const consumed =
    stock?.consumption ??
    customerConsumption.reduce((sum, row) => sum + Number(row.usedQty || 0), 0);
  const returned = stock?.returnQty ?? 0;
  const available = stock?.balanceMaterial ?? material.availableStock;

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
        subtitle={`${material.category} / ${material.unit} / ${material.store}`}
        actions={<InventoryActions material={material.name} labels />}
      />

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.45fr)]">
        <SectionCard title="Material Summary">
          <KeyValueGrid
            columns={3}
            items={[
              { icon: <PackageIcon size={15} />, label: "Unit", value: material.unit },
              { icon: <PackageIcon size={15} />, label: "Available", value: `${available} ${material.unit}` },
              { icon: <PackageIcon size={15} />, label: "Received", value: receivedQty || "-" },
              { icon: <PackageIcon size={15} />, label: "Issued", value: totalIssued || "-" },
              { icon: <PackageIcon size={15} />, label: "Consumed", value: consumed || "-" },
              { icon: <PackageIcon size={15} />, label: "Returned", value: returned || "-" },
            ]}
          />
        </SectionCard>
        <SectionCard title="Stock Status">
          <div className="space-y-3">
            <StockStatus row={material} />
            <KeyValueGrid
              compact
              items={[
                { icon: <PackageIcon size={15} />, label: "Store / Site", value: material.store },
                { icon: <ReceiptIcon size={15} />, label: "Purchase Rows", value: purchases.length },
                { icon: <UserIcon size={15} />, label: "Plumber Balances", value: plumberBalances.length },
              ]}
            />
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Plumber Ledger">
        <ExcelDataGrid
          columns={plumberBalanceColumns}
          rows={plumberBalances}
          maxHeightClassName="max-h-[34vh]"
          emptyTitle="No plumber balance for this material"
        />
      </SectionCard>

      <SectionCard title="Customer / BP Consumption">
        <ExcelDataGrid
          columns={customerConsumptionColumns}
          rows={customerConsumption}
          maxHeightClassName="max-h-[40vh]"
          emptyTitle="No customer consumption found for this material"
        />
      </SectionCard>

      <section className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Purchase / PBG Received">
          <ExcelDataGrid
            columns={purchaseColumns}
            rows={purchases}
            maxHeightClassName="max-h-[34vh]"
            emptyTitle="No purchase rows found"
          />
        </SectionCard>
        <SectionCard title="Store Issue Book">
          <ExcelDataGrid
            columns={storeIssueColumns}
            rows={storeIssues}
            maxHeightClassName="max-h-[34vh]"
            emptyTitle="No issue rows found"
          />
        </SectionCard>
      </section>

      <SectionCard title="Transaction History">
        <ExcelDataGrid
          columns={transactionColumns}
          rows={transactions}
          maxHeightClassName="max-h-[34vh]"
          emptyTitle="No transactions found"
        />
      </SectionCard>
    </div>
  );
}

const plumberBalanceColumns: ExcelColumn<
  ReturnType<typeof getMaterialPlumberBalances>[number]
>[] = [
  { key: "plumber", label: "Plumber / Team", width: 170, sticky: true, getValue: (row) => row.plumber },
  { key: "site", label: "Site", width: 190, getValue: (row) => row.site },
  { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor },
  { key: "totalIssued", label: "Total Issued", width: 130, getValue: (row) => row.totalIssued },
  { key: "consumed", label: "Consumed", width: 120, getValue: (row) => row.consumed },
  { key: "returned", label: "Returned", width: 120, getValue: (row) => row.returned },
  { key: "balance", label: "Balance", width: 120, getValue: (row) => row.balance },
  { key: "lastSlipNo", label: "Last Slip No.", width: 140, getValue: (row) => row.lastSlipNo },
  {
    key: "status",
    label: "Status",
    width: 150,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
];

const customerConsumptionColumns: ExcelColumn<
  ReturnType<typeof getMaterialCustomerConsumption>[number]
>[] = [
  { key: "bpNo", label: "BP / TR No.", width: 130, sticky: true, getValue: (row) => row.bpNo },
  { key: "customerName", label: "Customer", width: 180, sticky: true, getValue: (row) => row.customerName },
  { key: "usedQty", label: "Used Qty", width: 120, getValue: (row) => row.usedQty },
  { key: "address", label: "Address", width: 260, getValue: (row) => row.address },
  { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor },
  { key: "plumber", label: "Plumber", width: 130, getValue: (row) => row.plumber },
  { key: "installationDate", label: "Installation Date", width: 150, getValue: (row) => formatDate(row.installationDate) },
  { key: "testingDate", label: "Testing Date", width: 140, getValue: (row) => formatDate(row.testingDate) },
  { key: "reportNo", label: "Report No.", width: 140, getValue: (row) => row.reportNo },
  { key: "plumberBillNo", label: "Plumber Bill No.", width: 150, getValue: (row) => row.plumberBillNo },
  { key: "bgGasBillNo", label: "BG Gas Bill No.", width: 150, getValue: (row) => row.bgGasBillNo },
];

const purchaseColumns: ExcelColumn<ReturnType<typeof getMaterialPurchases>[number]>[] = [
  { key: "item", label: "Item", width: 220, sticky: true, getValue: (row) => row.item },
  { key: "vendor", label: "Vendor", width: 160, getValue: (row) => row.vendor },
  { key: "lastPurchaseDate", label: "Date", width: 130, getValue: (row) => formatDate(row.lastPurchaseDate) },
  { key: "totalPurchaseQty", label: "Purchase Qty", width: 140, getValue: (row) => row.totalPurchaseQty },
  { key: "totalAmount", label: "Total Amount", width: 150, getValue: (row) => row.totalAmount },
  { key: "invoice441Qty", label: "Inv 441 Qty", width: 120, getValue: (row) => row.invoice441Qty },
  { key: "invoice441Rate", label: "Inv 441 Rate", width: 130, getValue: (row) => row.invoice441Rate },
  { key: "invoice442Qty", label: "Inv 442 Qty", width: 120, getValue: (row) => row.invoice442Qty },
  { key: "invoice442Rate", label: "Inv 442 Rate", width: 130, getValue: (row) => row.invoice442Rate },
];

const storeIssueColumns: ExcelColumn<ReturnType<typeof getMaterialStoreIssues>[number]>[] = [
  { key: "itemName", label: "Item", width: 220, sticky: true, getValue: (row) => row.itemName },
  { key: "slipNo", label: "Slip No.", width: 120, getValue: (row) => row.slipNo },
  { key: "issueDate", label: "Date", width: 130, getValue: (row) => formatDate(row.issueDate) },
  { key: "totalIssue", label: "Total Issue", width: 130, getValue: (row) => row.totalIssue },
  { key: "ati", label: "ATI", width: 100, getValue: (row) => row.ati },
  { key: "babar", label: "Babar", width: 100, getValue: (row) => row.babar },
  { key: "abdul", label: "Abdul", width: 100, getValue: (row) => row.abdul },
  { key: "firoj", label: "Firoj", width: 100, getValue: (row) => row.firoj },
  { key: "jabed", label: "Jabed", width: 100, getValue: (row) => row.jabed },
  { key: "returnQty", label: "Return", width: 100, getValue: (row) => row.returnQty },
];

const transactionColumns: ExcelColumn<ReturnType<typeof getMaterialTransactions>[number]>[] = [
  { key: "type", label: "Type", width: 130, sticky: true, getValue: (row) => row.type },
  { key: "projectSite", label: "Project / Site", width: 190, getValue: (row) => row.projectSite },
  { key: "quantity", label: "Quantity", width: 130, getValue: (row) => row.quantity },
  { key: "by", label: "Updated By", width: 150, getValue: (row) => row.by },
  { key: "date", label: "Date", width: 130, getValue: (row) => formatDate(row.date) },
  { key: "remarks", label: "Remarks", width: 260, getValue: (row) => row.remarks },
];
