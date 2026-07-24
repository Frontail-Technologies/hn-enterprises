"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EyeIcon, NotePencilIcon } from "@phosphor-icons/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  materialConjunctionDetails,
  materials,
  plumberIssuedMaterials,
  plumberReturnedMaterials,
} from "../data/materials.data";
import type { InventoryTab } from "../types/commercial.types";
import { formatDate, uniqOptions } from "../utils/format";
import { InventoryActions } from "./inventory/InventoryActions";
import { InventoryTabNav } from "./inventory/InventoryTabNav";
import { MaterialDrawer } from "./inventory/MaterialDrawer";
import { StockStatus } from "./inventory/StockStatus";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";
import { TableSection } from "./shared/TableSection";

export function InventoryPage() {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
  });
  const [activeTab, setActiveTab] = useState<InventoryTab>("stock");
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return materials.filter(
      (row) =>
        (!search ||
          row.name.toLowerCase().includes(search) ||
          row.store.toLowerCase().includes(search)) &&
        (filters.category === "all" || row.category === filters.category) &&
        (filters.status === "all" || row.status === filters.status),
    );
  }, [filters]);
  const columns: ColumnDef<(typeof materials)[number]>[] = [
    {
      key: "name",
      header: "Material Name",
      render: (row) => (
        <Link
          className="font-semibold text-foreground hover:text-primary"
          href={`/inventory/${row.id}`}
        >
          {row.name}
        </Link>
      ),
    },
    { key: "category", header: "Category" },
    { key: "unit", header: "Unit" },
    {
      key: "availableStock",
      header: "Available Stock",
      render: (row) => <b>{row.availableStock}</b>,
    },
    { key: "issuedStock", header: "Issued Stock" },
    { key: "reorderLevel", header: "Reorder Level" },
    { key: "store", header: "Store / Site" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StockStatus row={row} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-36",
      render: (row) => <InventoryActions material={row.name} />,
    },
  ];
  const issuedColumns: ColumnDef<(typeof plumberIssuedMaterials)[number]>[] = [
    {
      key: "issueNo",
      header: "Issue No.",
      render: (row) => (
        <span className="font-semibold text-foreground">{row.issueNo}</span>
      ),
    },
    { key: "plumber", header: "Plumber / Team" },
    { key: "projectSite", header: "Project / Site" },
    { key: "material", header: "Material" },
    { key: "quantity", header: "Issued Qty" },
    {
      key: "issuedDate",
      header: "Issued Date",
      render: (row) => formatDate(row.issuedDate),
    },
    { key: "issuedBy", header: "Issued By" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: () => (
        <MaterialDrawer
          action="Issue Material"
          icon={<NotePencilIcon size={15} />}
          iconOnly
        />
      ),
    },
  ];
  const returnColumns: ColumnDef<(typeof plumberReturnedMaterials)[number]>[] =
    [
      {
        key: "returnNo",
        header: "Return No.",
        render: (row) => (
          <span className="font-semibold text-foreground">{row.returnNo}</span>
        ),
      },
      { key: "plumber", header: "Plumber / Team" },
      { key: "projectSite", header: "Project / Site" },
      { key: "material", header: "Material" },
      { key: "quantity", header: "Return Qty" },
      {
        key: "returnDate",
        header: "Return Date",
        render: (row) => formatDate(row.returnDate),
      },
      { key: "condition", header: "Condition" },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        header: "Actions",
        className: "w-20",
        render: () => (
          <MaterialDrawer
            action="Return Material"
            icon={<NotePencilIcon size={15} />}
            iconOnly
          />
        ),
      },
    ];
  const conjunctionColumns: ColumnDef<
    (typeof materialConjunctionDetails)[number]
  >[] = [
    {
      key: "referenceNo",
      header: "Reference No.",
      render: (row) => (
        <span className="font-semibold text-foreground">{row.referenceNo}</span>
      ),
    },
    { key: "customer", header: "Customer" },
    { key: "bpTrNo", header: "BP / TR No." },
    { key: "plumber", header: "Plumber / Team" },
    { key: "materialUsed", header: "Material Used" },
    { key: "usedQty", header: "Used Qty" },
    { key: "balanceQty", header: "Balance Qty" },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
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
      <TableSection>
        {activeTab === "stock" ? (
          <>
            <FilterSheetButton
              searchKey="search"
              searchPlaceholder="Search material or store..."
              title="Inventory Filters"
              values={filters}
              filters={[
                {
                  key: "category",
                  placeholder: "All Categories",
                  options: uniqOptions(materials.map((row) => row.category)),
                },
                {
                  key: "status",
                  placeholder: "All Statuses",
                  options: uniqOptions(materials.map((row) => row.status)),
                },
              ]}
              onChange={(key, value) =>
                setFilters((current) => ({ ...current, [key]: value }))
              }
              onReset={() =>
                setFilters({ search: "", category: "all", status: "all" })
              }
            />
            <PaginatedDataTable data={data} columns={columns} />
          </>
        ) : null}
        {activeTab === "issued" ? (
          <PaginatedDataTable
            data={plumberIssuedMaterials}
            columns={issuedColumns}
          />
        ) : null}
        {activeTab === "return" ? (
          <PaginatedDataTable
            data={plumberReturnedMaterials}
            columns={returnColumns}
          />
        ) : null}
        {activeTab === "conjunction" ? (
          <PaginatedDataTable
            data={materialConjunctionDetails}
            columns={conjunctionColumns}
          />
        ) : null}
      </TableSection>
    </div>
  );
}
