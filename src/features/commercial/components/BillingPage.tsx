"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { buttonVariants } from "@/components/ui/button";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { billingTabs } from "../data/bills.data";
import type { BillingView } from "../types/commercial.types";
import type { Bill } from "../types/bill.types";
import { useBillsQuery } from "../hooks/useBills";
import { formatDate, money, sum, uniqOptions } from "../utils/format";
import { getBillHref } from "../utils/billing.utils";
import { BillDrawer } from "./billing/BillDrawer";
import { BillingActions } from "./billing/BillingActions";
import { WageRegister } from "./billing/WageRegister";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";
import { TableSection } from "./shared/TableSection";

export function BillingPage() {
  const [activeView, setActiveView] = useState<BillingView>("wages");
  const { data: bills = [] } = useBillsQuery();
  const { data: projects = [] } = useProjectsQuery();
  const projectNameById = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);
  const totals = {
    billed: sum(bills.map((bill) => bill.totalAmount)),
    received: sum(bills.map((bill) => bill.paidAmount)),
    pending: sum(bills.map((bill) => bill.pendingAmount)),
    overdue: sum(
      bills
        .filter((bill) => bill.status === "Overdue")
        .map((bill) => bill.pendingAmount),
    ),
  };
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    project: "all",
  });
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return bills.filter((row) => {
      const projectName = projectNameById.get(row.projectId) ?? "";
      return (
        (!search || [row.billNumber, projectName].join(" ").toLowerCase().includes(search)) &&
        (filters.status === "all" || row.status === filters.status) &&
        (filters.project === "all" || projectName === filters.project)
      );
    });
  }, [bills, filters, projectNameById]);
  const columns: ColumnDef<Bill>[] = [
    {
      key: "billNumber",
      header: "Bill Number",
      render: (row) => (
        <Link
          href={getBillHref(row)}
          className="font-semibold text-foreground hover:text-primary"
        >
          {row.billNumber}
        </Link>
      ),
    },
    {
      key: "project",
      header: "Project",
      render: (row) => (
        <p className="font-medium text-foreground">{projectNameById.get(row.projectId) ?? "-"}</p>
      ),
    },
    {
      key: "billDate",
      header: "Bill Date",
      render: (row) => formatDate(row.billDate),
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      render: (row) => money(row.totalAmount),
    },
    {
      key: "paidAmount",
      header: "Paid Amount",
      render: (row) => money(row.paidAmount),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32",
      render: (row) => <BillingActions bill={row} />,
    },
  ];

  const exportColumns: ExportColumn<Bill>[] = [
    { label: "Bill Number", getValue: (row) => row.billNumber },
    { label: "Project", getValue: (row) => projectNameById.get(row.projectId) ?? "-" },
    { label: "Bill Date", getValue: (row) => formatDate(row.billDate) },
    { label: "Total Amount", getValue: (row) => row.totalAmount },
    { label: "Paid Amount", getValue: (row) => row.paidAmount },
    { label: "Status", getValue: (row) => row.status },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Billing"
        subtitle="Track bills, invoices and received payments."
        actions={
          activeView === "bills" ? (
            <>
              <button
                type="button"
                className={buttonVariants({ variant: "outline", size: "default" })}
                onClick={() => void exportRowsToExcel("bills.xlsx", exportColumns, data)}
              >
                <DownloadSimpleIcon size={15} />
                Export Excel
              </button>
              <BillDrawer triggerLabel="Create Bill" />
            </>
          ) : (
            <BillDrawer triggerLabel="Create Bill" />
          )
        }
      />
      <UnderlineTabs
        items={billingTabs}
        active={activeView}
        onChange={(id) => setActiveView(id as BillingView)}
      />
      {activeView === "bills" ? (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>
              Total billed: <span className="font-semibold text-foreground">{money(totals.billed)}</span>
            </span>
            <span>
              Received: <span className="font-semibold text-foreground">{money(totals.received)}</span>
            </span>
            <span>
              Pending: <span className="font-semibold text-foreground">{money(totals.pending)}</span>
            </span>
            <span>
              Overdue: <span className="font-semibold text-destructive">{money(totals.overdue)}</span>
            </span>
          </div>
          <TableSection>
            <FilterSheetButton
              searchKey="search"
              searchPlaceholder="Search bill or project..."
              title="Billing Filters"
              values={filters}
              filters={[
                {
                  key: "project",
                  placeholder: "All Projects",
                  options: uniqOptions(
                    bills
                      .map((row) => projectNameById.get(row.projectId))
                      .filter((name): name is string => Boolean(name)),
                  ),
                },
                {
                  key: "status",
                  placeholder: "All Statuses",
                  options: uniqOptions(bills.map((row) => row.status)),
                },
              ]}
              onChange={(key, value) =>
                setFilters((current) => ({ ...current, [key]: value }))
              }
              onReset={() =>
                setFilters({ search: "", status: "all", project: "all" })
              }
            />
            <PaginatedDataTable data={data} columns={columns} />
          </TableSection>
        </>
      ) : (
        <WageRegister />
      )}
    </div>
  );
}
