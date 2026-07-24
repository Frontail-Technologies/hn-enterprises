"use client";

import { CalendarBlankIcon, CurrencyInrIcon, DownloadSimpleIcon, FileTextIcon, ReceiptIcon, UserIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { paymentHistory } from "../data/bills.data";
import { formatDate, money } from "../utils/format";
import { getBill } from "../utils/billing.utils";
import { BillingActions } from "./billing/BillingActions";
import { CommercialBreadcrumb } from "./shared/CommercialBreadcrumb";
import { DetailSummaryCard } from "./shared/DetailSummaryCard";
import { Panel } from "./shared/Panel";

export function BillingDetailPage({ id }: { id: string }) {
  const bill = getBill(id);
  const paymentsForBill = paymentHistory.filter(
    (item) => item.billId === bill.id,
  );
  const columns: ColumnDef<(typeof paymentHistory)[number]>[] = [
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    {
      key: "amount",
      header: "Amount",
      render: (row) => <b>{money(row.amount)}</b>,
    },
    { key: "mode", header: "Mode" },
    { key: "receivedBy", header: "Received By" },
    { key: "remarks", header: "Remarks" },
  ];

  return (
    <div className="space-y-5">
      <CommercialBreadcrumb
        items={[
          { label: "Billing", href: "/billing" },
          { label: bill.billNumber },
        ]}
      />
      <PageHeader
        title={bill.billNumber}
        subtitle={`${bill.stage} billing for ${bill.projectCustomer}`}
        actions={<BillingActions bill={bill.billNumber} labels />}
      />
      <DetailSummaryCard
        title="Bill Overview"
        status={<StatusBadge status={bill.status} />}
        leftItems={[
          {
            icon: <FileTextIcon size={15} />,
            label: "Bill Number",
            value: bill.billNumber,
          },
          {
            icon: <CalendarBlankIcon size={15} />,
            label: "Bill Date",
            value: formatDate(bill.billDate),
          },
          {
            icon: <CalendarBlankIcon size={15} />,
            label: "Due Date",
            value: formatDate(bill.dueDate),
          },
          {
            icon: <CurrencyInrIcon size={15} />,
            label: "Amount",
            value: money(bill.totalAmount),
          },
          {
            icon: <CurrencyInrIcon size={15} />,
            label: "Tax",
            value: money(bill.tax),
          },
        ]}
        rightTitle="Collection"
        rightItems={[
          {
            icon: <UserIcon size={15} />,
            label: "Project / Customer",
            value: bill.projectCustomer,
          },
          {
            icon: <FileTextIcon size={15} />,
            label: "Billing Stage",
            value: bill.stage,
          },
          {
            icon: <CurrencyInrIcon size={15} />,
            label: "Paid Amount",
            value: money(bill.paidAmount),
          },
          {
            icon: <CurrencyInrIcon size={15} />,
            label: "Pending Amount",
            value: money(bill.pendingAmount),
          },
          {
            icon: <ReceiptIcon size={15} />,
            label: "Invoice / PDF",
            value: `${bill.billNumber}.pdf`,
          },
        ]}
      />
      <Panel
        title="Payment History"
        actions={
          <Button type="button" variant="outline" size="sm">
            <DownloadSimpleIcon size={14} />
            Download Invoice
          </Button>
        }
      >
        <DataTable data={paymentsForBill} columns={columns} />
      </Panel>
    </div>
  );
}
