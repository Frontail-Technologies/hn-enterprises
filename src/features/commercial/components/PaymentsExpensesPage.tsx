"use client";

import { useState } from "react";
import { FileTextIcon, NotePencilIcon, PlusIcon, ReceiptIcon, WarningIcon, EyeIcon } from "@phosphor-icons/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { type ColumnDef } from "@/components/shared/DataTable";
import { DrawerShell } from "@/components/shared/DrawerShell";
import { type ImagePreviewItem } from "@/components/shared/ImageUploadPreview";
import { PageHeader } from "@/components/shared/PageHeader";
import { QuickField } from "@/components/shared/QuickField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { paymentTabs, payments } from "../data/payments.data";
import { formatDate, money, sum } from "../utils/format";
import { ImageProofField } from "./shared/ImageProofField";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";
import { StatCardRow, SummaryValue } from "./shared/StatCards";
import { TableSection } from "./shared/TableSection";

export function PaymentsExpensesPage() {
  const [active, setActive] = useState(paymentTabs[0]);
  const monthlyTotal = sum(
    payments
      .filter((row) => row.status === "Approved")
      .map((row) => row.amount),
  );
  const data = payments.filter((row) => row.category === active);
  const columns: ColumnDef<(typeof payments)[number]>[] = [
    {
      key: "id",
      header: "Entry ID",
      render: (row) => <b>{row.id.toUpperCase()}</b>,
    },
    { key: "category", header: "Category" },
    { key: "paidTo", header: "Paid To" },
    { key: "projectSite", header: "Project / Site" },
    { key: "amount", header: "Amount", render: (row) => money(row.amount) },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "mode", header: "Payment Mode" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "attachment",
      header: "Attachment",
      render: (row) =>
        row.attachment === "-" ? (
          "-"
        ) : (
          <span className="font-medium text-primary">{row.attachment}</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: () => <PaymentActions />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments & Expenses"
        subtitle="Manage field payments, rent, material expenses and approvals."
        actions={<PaymentDrawer />}
      />
      <StatCardRow>
        <SummaryValue
          label="Approved This Month"
          value={money(monthlyTotal)}
          icon={<ReceiptIcon size={17} />}
        />
        <SummaryValue
          label="Submitted"
          value={String(
            payments.filter((row) => row.status === "Submitted").length,
          )}
          icon={<FileTextIcon size={17} />}
        />
        <SummaryValue
          label="Draft / Rejected"
          value={String(
            payments.filter(
              (row) => row.status === "Draft" || row.status === "Rejected",
            ).length,
          )}
          icon={<WarningIcon size={17} />}
          warn
        />
      </StatCardRow>
      <PaymentTabNav active={active} onChange={setActive} />
      <TableSection>
        <PaginatedDataTable data={data} columns={columns} />
      </TableSection>
    </div>
  );
}

function PaymentActions() {
  return (
    <div className="flex items-center gap-1">
      <ActionButton label="View" icon={<EyeIcon size={15} />} />
      <PaymentDrawer mode="edit" iconOnly />
    </div>
  );
}

function PaymentDrawer({
  mode = "add",
  iconOnly = false,
}: {
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  const existingImages: ImagePreviewItem[] =
    mode === "edit"
      ? [
          {
            id: "receipt-proof-1",
            label: "Payment receipt",
            fileName: "receipt-group-a.jpg",
            uploadedOn: "2025-02-15",
          },
        ]
      : [];

  return (
    <DrawerShell
      title={
        mode === "edit" ? "Edit Payment / Expense" : "Add Payment / Expense"
      }
      description="Record payment, receipt and approval information."
      triggerLabel={mode === "edit" ? "Edit" : "Add Payment / Expense"}
      icon={
        mode === "edit" ? <NotePencilIcon size={15} /> : <PlusIcon size={15} />
      }
      iconOnly={iconOnly}
    >
      <QuickField label="Category" select options={paymentTabs} />
      <QuickField label="Payee" />
      <QuickField label="Project / Site" />
      <QuickField label="Amount" />
      <QuickField label="Date" date />
      <QuickField
        label="Payment Mode"
        select
        options={["Cash", "UPI", "Bank Transfer", "NEFT", "Cheque"]}
      />
      <ImageProofField
        label="Receipt / Photo"
        description="Upload payment proof, expense bill or receipt image."
        images={existingImages}
      />
      <QuickField
        label="Status"
        select
        options={["Draft", "Submitted", "Approved", "Rejected"]}
      />
      <QuickField label="Remarks" textarea />
    </DrawerShell>
  );
}

function PaymentTabNav({
  active,
  onChange,
}: {
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto border-b border-border/70">
      {paymentTabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "inline-flex h-10 shrink-0 items-center border-b-2 px-0.5 text-sm font-medium transition-colors",
            active === tab
              ? "border-b-primary text-primary font-semibold"
              : "border-b-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
