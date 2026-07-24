"use client";

import { FileTextIcon, MapPinIcon, PackageIcon, ReceiptIcon, UserIcon, WarningIcon } from "@phosphor-icons/react";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { materialTransactions } from "../data/materials.data";
import { getMaterial } from "../utils/inventory.utils";
import { formatDate } from "../utils/format";
import { InventoryActions } from "./inventory/InventoryActions";
import { StockStatus } from "./inventory/StockStatus";
import { CommercialBreadcrumb } from "./shared/CommercialBreadcrumb";
import { DetailSummaryCard } from "./shared/DetailSummaryCard";
import { Panel } from "./shared/Panel";

export function InventoryDetailPage({ id }: { id: string }) {
  const material = getMaterial(id);
  const transactions = materialTransactions.filter(
    (item) => item.materialId === material.id,
  );
  const columns: ColumnDef<(typeof materialTransactions)[number]>[] = [
    { key: "type", header: "Type", render: (row) => <b>{row.type}</b> },
    { key: "projectSite", header: "Project / Site" },
    { key: "quantity", header: "Quantity" },
    { key: "by", header: "Updated By" },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "remarks", header: "Remarks" },
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
        subtitle={`${material.category} stock at ${material.store}`}
        actions={<InventoryActions material={material.name} labels />}
      />
      <DetailSummaryCard
        title="Material Overview"
        status={<StockStatus row={material} />}
        leftItems={[
          {
            icon: <PackageIcon size={15} />,
            label: "Category",
            value: material.category,
          },
          {
            icon: <PackageIcon size={15} />,
            label: "Unit",
            value: material.unit,
          },
          {
            icon: <PackageIcon size={15} />,
            label: "Available Stock",
            value: `${material.availableStock} ${material.unit}`,
          },
          {
            icon: <PackageIcon size={15} />,
            label: "Issued Stock",
            value: `${material.issuedStock} ${material.unit}`,
          },
          {
            icon: <WarningIcon size={15} />,
            label: "Reorder Level",
            value: `${material.reorderLevel} ${material.unit}`,
          },
        ]}
        rightTitle="Reconciliation"
        rightItems={[
          {
            icon: <MapPinIcon size={15} />,
            label: "Store / Site",
            value: material.store,
          },
          {
            icon: <FileTextIcon size={15} />,
            label: "Linked Project",
            value: "Shyam Nagar CGD Project",
          },
          {
            icon: <UserIcon size={15} />,
            label: "Plumber Record",
            value: "Group A reconciliation pending",
          },
          {
            icon: <ReceiptIcon size={15} />,
            label: "Latest Receipt",
            value: "purchase-receipt-021.jpg",
          },
        ]}
      />
      <Panel title="Transaction History">
        <DataTable data={transactions} columns={columns} />
      </Panel>
    </div>
  );
}
