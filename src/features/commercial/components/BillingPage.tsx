"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileTextIcon, ReceiptIcon, WarningIcon } from "@phosphor-icons/react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { customers } from "@/features/customers/services/customers.mock";
import { billingTabs, bills } from "../data/bills.data";
import { wageRegisterRows } from "../data/wages.data";
import type { BillingView } from "../types/commercial.types";
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
  const wageTotals = {
    gross: sum(wageRegisterRows.map((row) => row.total)),
    deductions: sum(wageRegisterRows.map((row) => row.totalDeduction)),
    net: sum(wageRegisterRows.map((row) => row.netPayment)),
    pending: wageRegisterRows.filter((row) => row.status === "Pending").length,
  };
  const [filters, setFilters] = useState({
    search: "",
    stage: "all",
    status: "all",
    supervisor: "all",
  });
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return bills.filter(
      (row) => {
        const customer = getBillCustomer(row);
        return (
          (!search ||
            [
              row.billNumber,
              row.projectCustomer,
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
      },
    );
  }, [filters]);
  const columns: ColumnDef<(typeof bills)[number]>[] = [
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
              {customer?.customerConnection.customerName ?? row.projectCustomer}
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
      render: (row) => getBillCustomer(row)?.customerConnection.supervisorName ?? "-",
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
      render: (row) => <BillingActions bill={row.billNumber} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Billing"
        subtitle="Track bills, invoices and received payments."
        actions={<BillDrawer action="Create Bill" />}
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
                    customers.map((customer) => customer.customerConnection.supervisorName),
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
        <>
          <StatCardRow>
            <SummaryValue label="Gross Wages" value={money(wageTotals.gross)} />
            <SummaryValue
              label="Deductions"
              value={money(wageTotals.deductions)}
              icon={<FileTextIcon size={17} />}
            />
            <SummaryValue
              label="Net Payable"
              value={money(wageTotals.net)}
              icon={<ReceiptIcon size={17} />}
            />
            <SummaryValue
              label="Pending Payments"
              value={String(wageTotals.pending)}
              icon={<WarningIcon size={17} />}
              warn
            />
          </StatCardRow>
          <WageRegister />
        </>
      )}
    </div>
  );
}

function getBillCustomer(bill: (typeof bills)[number]) {
  return bill.customerId
    ? customers.find((customer) => customer.id === bill.customerId)
    : customers.find(
        (customer) => customer.customerConnection.customerName === bill.projectCustomer,
      );
}
