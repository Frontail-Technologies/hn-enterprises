"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DownloadSimpleIcon, FileTextIcon, ReceiptIcon, WarningIcon } from "@phosphor-icons/react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { buttonVariants } from "@/components/ui/button";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
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
import { StatCardRow, SummaryValue } from "./shared/StatCards";
import { TableSection } from "./shared/TableSection";

export function BillingPage() {
  const [activeView, setActiveView] = useState<BillingView>("wages");
  const { data: bills = [] } = useBillsQuery();
  const { data: customers = [] } = useCustomersQuery();
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
    stage: "all",
    status: "all",
    supervisor: "all",
  });
  const getBillCustomer = useMemo(
    () => (bill: Bill) => customers.find((customer) => customer.id === bill.customerId),
    [customers],
  );
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return bills.filter((row) => {
      const customer = getBillCustomer(row);
      return (
        (!search ||
          [
            row.billNumber,
            customer?.customerConnection.customerName,
            customer?.siteArea,
            customer?.customerConnection.supervisorName,
          ]
            .join(" ")
            .toLowerCase()
            .includes(search)) &&
        (filters.stage === "all" || row.stage === filters.stage) &&
        (filters.status === "all" || row.status === filters.status) &&
        (filters.supervisor === "all" ||
          customer?.customerConnection.supervisorName === filters.supervisor)
      );
    });
  }, [bills, filters, getBillCustomer]);
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
      key: "projectCustomer",
      header: "Customer / Project",
      render: (row) => {
        const customer = getBillCustomer(row);
        return (
          <div>
            <p className="font-medium text-foreground">
              {customer?.customerConnection.customerName ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              {customer?.siteArea ?? "Project billing"}
            </p>
          </div>
        );
      },
    },
    {
      key: "supervisor",
      header: "Supervisor",
      render: (row) => getBillCustomer(row)?.customerConnection.supervisorName || "-",
    },
    { key: "stage", header: "Billing Stage" },
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
      key: "pendingAmount",
      header: "Pending Amount",
      render: (row) => <b>{money(row.pendingAmount)}</b>,
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
    { label: "Customer", getValue: (row) => getBillCustomer(row)?.customerConnection.customerName ?? "-" },
    { label: "Site", getValue: (row) => getBillCustomer(row)?.siteArea ?? "-" },
    { label: "Supervisor", getValue: (row) => getBillCustomer(row)?.customerConnection.supervisorName || "-" },
    { label: "Billing Stage", getValue: (row) => row.stage },
    { label: "Bill Date", getValue: (row) => formatDate(row.billDate) },
    { label: "Total Amount", getValue: (row) => row.totalAmount },
    { label: "Paid Amount", getValue: (row) => row.paidAmount },
    { label: "Pending Amount", getValue: (row) => row.pendingAmount },
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
          <StatCardRow>
            <SummaryValue label="Total Billed" value={money(totals.billed)} />
            <SummaryValue
              label="Received"
              value={money(totals.received)}
              icon={<ReceiptIcon size={17} />}
            />
            <SummaryValue
              label="Pending"
              value={money(totals.pending)}
              icon={<FileTextIcon size={17} />}
            />
            <SummaryValue
              label="Overdue"
              value={money(totals.overdue)}
              icon={<WarningIcon size={17} />}
              warn
            />
          </StatCardRow>
          <TableSection>
            <FilterSheetButton
              searchKey="search"
              searchPlaceholder="Search bill or customer..."
              title="Billing Filters"
              values={filters}
              filters={[
                {
                  key: "stage",
                  placeholder: "All Stages",
                  options: uniqOptions(bills.map((row) => row.stage)),
                },
                {
                  key: "status",
                  placeholder: "All Statuses",
                  options: uniqOptions(bills.map((row) => row.status)),
                },
                {
                  key: "supervisor",
                  placeholder: "All Supervisors",
                  options: uniqOptions(
                    customers
                      .map((customer) => customer.customerConnection.supervisorName)
                      .filter((name): name is string => Boolean(name)),
                  ),
                },
              ]}
              onChange={(key, value) =>
                setFilters((current) => ({ ...current, [key]: value }))
              }
              onReset={() =>
                setFilters({ search: "", stage: "all", status: "all", supervisor: "all" })
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
