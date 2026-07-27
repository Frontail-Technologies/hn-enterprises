"use client";

import { useState } from "react";
import Link from "next/link";
import { EyeIcon, NotePencilIcon } from "@phosphor-icons/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  materialConjunctionDetails,
  materials,
  plumberIssuedMaterials,
  plumberReturnedMaterials,
} from "../data/materials.data";
import type { InventoryTab } from "../types/commercial.types";
import { formatDate } from "../utils/format";
import { InventoryActions } from "./inventory/InventoryActions";
import { InventoryTabNav } from "./inventory/InventoryTabNav";
import { MaterialDrawer } from "./inventory/MaterialDrawer";
import { StockStatus } from "./inventory/StockStatus";

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>("stock");

  const stockColumns: ExcelColumn<(typeof materials)[number]>[] = [
    {
      key: "name",
      label: "Material Name",
      width: 220,
      sticky: true,
      getValue: (row) => row.name,
      render: (row) => (
        <Link
          className="font-semibold text-foreground hover:text-primary"
          href={`/inventory/${row.id}`}
        >
          {row.name}
        </Link>
      ),
    },
    { key: "category", label: "Category", width: 140, getValue: (row) => row.category },
    { key: "unit", label: "Unit", width: 110, getValue: (row) => row.unit },
    {
      key: "availableStock",
      label: "Available Stock",
      width: 150,
      getValue: (row) => row.availableStock,
      render: (row) => <span className="font-semibold text-foreground">{row.availableStock}</span>,
    },
    { key: "issuedStock", label: "Issued Stock", width: 140, getValue: (row) => row.issuedStock },
    { key: "reorderLevel", label: "Reorder Level", width: 140, getValue: (row) => row.reorderLevel },
    { key: "store", label: "Store / Site", width: 190, getValue: (row) => row.store },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StockStatus row={row} />,
    },
    {
      key: "actions",
      label: "Actions",
      width: 150,
      getValue: () => "Actions",
      render: (row) => <InventoryActions material={row.name} />,
    },
  ];
  const issuedColumns: ExcelColumn<(typeof plumberIssuedMaterials)[number]>[] = [
    {
      key: "issueNo",
      label: "Issue No.",
      width: 150,
      sticky: true,
      getValue: (row) => row.issueNo,
      render: (row) => (
        <span className="font-semibold text-foreground">{row.issueNo}</span>
      ),
    },
    { key: "site", label: "Site", width: 190, getValue: (row) => row.site },
    { key: "customer", label: "Customer", width: 170, getValue: (row) => row.customer },
    { key: "bpTrNo", label: "BP / TR No.", width: 140, getValue: (row) => row.bpTrNo },
    { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor },
    { key: "plumber", label: "Plumber / Team", width: 160, getValue: (row) => row.plumber },
    { key: "material", label: "Material", width: 180, getValue: (row) => row.material },
    { key: "quantity", label: "Issued Qty", width: 130, getValue: (row) => row.quantity },
    {
      key: "issuedDate",
      label: "Issued Date",
      width: 130,
      getValue: (row) => formatDate(row.issuedDate),
    },
    { key: "issuedBy", label: "Issued By", width: 150, getValue: (row) => row.issuedBy },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      width: 90,
      getValue: () => "Actions",
      render: () => (
        <MaterialDrawer
          action="Issue Material"
          icon={<NotePencilIcon size={15} />}
          iconOnly
        />
      ),
    },
  ];
  const returnColumns: ExcelColumn<(typeof plumberReturnedMaterials)[number]>[] =
    [
      {
        key: "returnNo",
        label: "Return No.",
        width: 150,
        sticky: true,
        getValue: (row) => row.returnNo,
        render: (row) => (
          <span className="font-semibold text-foreground">{row.returnNo}</span>
        ),
      },
      { key: "plumber", label: "Plumber / Team", width: 160, getValue: (row) => row.plumber },
      { key: "site", label: "Site", width: 190, getValue: (row) => row.site },
      { key: "customer", label: "Customer", width: 170, getValue: (row) => row.customer },
      { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor },
      { key: "material", label: "Material", width: 180, getValue: (row) => row.material },
      { key: "quantity", label: "Return Qty", width: 130, getValue: (row) => row.quantity },
      {
        key: "returnDate",
        label: "Return Date",
        width: 130,
        getValue: (row) => formatDate(row.returnDate),
      },
      { key: "condition", label: "Condition", width: 140, getValue: (row) => row.condition },
      {
        key: "status",
        label: "Status",
        width: 140,
        getValue: (row) => row.status,
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        label: "Actions",
        width: 90,
        getValue: () => "Actions",
        render: () => (
          <MaterialDrawer
            action="Return Material"
            icon={<NotePencilIcon size={15} />}
            iconOnly
          />
        ),
      },
    ];
  const conjunctionColumns: ExcelColumn<
    (typeof materialConjunctionDetails)[number]
  >[] = [
    {
      key: "referenceNo",
      label: "Reference No.",
      width: 170,
      sticky: true,
      getValue: (row) => row.referenceNo,
      render: (row) => (
        <span className="font-semibold text-foreground">{row.referenceNo}</span>
      ),
    },
    { key: "customer", label: "Customer", width: 170, getValue: (row) => row.customer },
    { key: "bpTrNo", label: "BP / TR No.", width: 140, getValue: (row) => row.bpTrNo },
    { key: "site", label: "Site", width: 190, getValue: (row) => row.site },
    { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor },
    { key: "plumber", label: "Plumber / Team", width: 160, getValue: (row) => row.plumber },
    { key: "materialUsed", label: "Material Used", width: 180, getValue: (row) => row.materialUsed },
    { key: "usedQty", label: "Used Qty", width: 120, getValue: (row) => row.usedQty },
    { key: "balanceQty", label: "Balance Qty", width: 130, getValue: (row) => row.balanceQty },
    { key: "date", label: "Date", width: 130, getValue: (row) => formatDate(row.date) },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      width: 90,
      getValue: () => "Actions",
      render: () => <ActionButton label="View" icon={<EyeIcon size={15} />} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory & Material"
        subtitle="Track stock, material issues, receipts and plumber reconciliation."
        actions={<MaterialDrawer action="Add Stock" />}
      />
      <InventoryTabNav activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "stock" ? (
        <ExcelDataGrid columns={stockColumns} rows={materials} emptyTitle="No materials found" />
      ) : null}
      {activeTab === "issued" ? (
        <ExcelDataGrid columns={issuedColumns} rows={plumberIssuedMaterials} emptyTitle="No issued materials found" />
      ) : null}
      {activeTab === "return" ? (
        <ExcelDataGrid columns={returnColumns} rows={plumberReturnedMaterials} emptyTitle="No return records found" />
      ) : null}
      {activeTab === "conjunction" ? (
        <ExcelDataGrid columns={conjunctionColumns} rows={materialConjunctionDetails} emptyTitle="No conjunction records found" />
      ) : null}
    </div>
  );
}
