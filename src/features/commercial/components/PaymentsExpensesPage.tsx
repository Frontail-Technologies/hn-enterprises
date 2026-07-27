"use client";

import { useState } from "react";
import { FileTextIcon, NotePencilIcon, PlusIcon, ReceiptIcon, WarningIcon, EyeIcon } from "@phosphor-icons/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { DrawerShell } from "@/components/shared/DrawerShell";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { type ImagePreviewItem } from "@/components/shared/ImageUploadPreview";
import { PageHeader } from "@/components/shared/PageHeader";
import { QuickField } from "@/components/shared/QuickField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { paymentTabs, payments } from "../data/payments.data";
import { formatDate, money, sum } from "../utils/format";
import { ImageProofField } from "./shared/ImageProofField";
import { StatCardRow, SummaryValue } from "./shared/StatCards";

export function PaymentsExpensesPage() {
  const [active, setActive] = useState(paymentTabs[0]);
  const monthlyTotal = sum(
    payments
      .filter((row) => row.status === "Approved")
      .map((row) => row.amount),
  );
  const data = payments.filter((row) => row.category === active);
  const columns: ExcelColumn<(typeof payments)[number]>[] = [
    {
      key: "id",
      label: "Entry ID",
      width: 130,
      sticky: true,
      getValue: (row) => row.id.toUpperCase(),
      render: (row) => (
        <span className="font-semibold text-foreground">{row.id.toUpperCase()}</span>
      ),
    },
    { key: "category", label: "Category", width: 190, getValue: (row) => row.category },
    { key: "paidTo", label: "Paid To", width: 180, getValue: (row) => row.paidTo },
    { key: "site", label: "Site", width: 190, getValue: (row) => row.site },
    { key: "supervisor", label: "Supervisor", width: 170, getValue: (row) => row.supervisor },
    { key: "customer", label: "Customer", width: 170, getValue: (row) => row.customer },
    { key: "amount", label: "Amount", width: 130, getValue: (row) => money(row.amount) },
    { key: "date", label: "Date", width: 130, getValue: (row) => formatDate(row.date) },
    { key: "mode", label: "Payment Mode", width: 150, getValue: (row) => row.mode },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "attachment",
      label: "Attachment",
      width: 180,
      getValue: (row) => row.attachment,
      render: (row) =>
        row.attachment === "-" ? (
          "-"
        ) : (
          <span className="font-medium text-primary">{row.attachment}</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      getValue: () => "Actions",
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
      <ExcelDataGrid columns={columns} rows={data} emptyTitle="No expenses found" />
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
