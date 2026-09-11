"use client";

import { TrashIcon, WalletIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { ExcelDataGrid } from "@/components/shared/ExcelDataGrid";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge, type StatusValue } from "@/components/shared/StatusBadge";
import { PaymentDialog } from "@/features/commercial/components/PaymentDialog";
import { useDeletePayment, usePaymentsQuery } from "@/features/commercial/hooks/usePayments";
import { formatDate as formatMoneyDate, money } from "@/features/commercial/utils/format";
import { ProjectTabHeader } from "./ProjectTabHeader";

export function ProjectExpensesTab({ projectId, projectName }: { projectId: string; projectName: string }) {
  const { data: payments = [], isLoading } = usePaymentsQuery({ projectId });
  const deletePayment = useDeletePayment();

  const total = payments.reduce((sum, row) => sum + row.amount, 0);
  const approved = payments.filter((row) => row.status === "Approved").reduce((sum, row) => sum + row.amount, 0);
  const pending = payments
    .filter((row) => row.status === "Draft" || row.status === "Submitted")
    .reduce((sum, row) => sum + row.amount, 0);

  const columns: ExcelColumn<(typeof payments)[number]>[] = [
    { key: "category", label: "Category", width: 180, sticky: true, getValue: (row) => row.category },
    { key: "customer", label: "Customer", width: 170, getValue: (row) => row.customerName || "-" },
    { key: "supervisor", label: "Supervisor", width: 150, getValue: (row) => row.supervisorName || "-" },
    { key: "paidTo", label: "Paid To", width: 170, getValue: (row) => row.paidTo || "-" },
    { key: "amount", label: "Amount", width: 130, getValue: (row) => money(row.amount) },
    { key: "date", label: "Date", width: 130, getValue: (row) => formatMoneyDate(row.paymentDate) },
    { key: "mode", label: "Mode", width: 130, getValue: (row) => row.mode },
    {
      key: "status",
      label: "Status",
      width: 130,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status as StatusValue} />,
    },
    { key: "purpose", label: "Purpose", width: 220, getValue: (row) => row.purpose || "-" },
    {
      key: "createdBy",
      label: "Created By",
      width: 160,
      getValue: (row) =>
        row.createdByName && row.createdByName !== row.supervisorName
          ? `${row.createdByName} (for ${row.supervisorName || "supervisor"})`
          : row.createdByName || "-",
    },
    {
      key: "actions",
      label: "Actions",
      width: 110,
      getValue: () => "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <PaymentDialog payment={row} iconOnly />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Delete expense"
            onClick={() => deletePayment.mutate(row.id)}
          >
            <TrashIcon size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ProjectTabHeader
        title="Expenses"
        actions={<PaymentDialog defaultProjectId={projectId} defaultProjectName={projectName} />}
      />

      <CompactStatGrid columns={3}>
        <MetricCard label="Total Expenses" value={money(total)} icon={WalletIcon} />
        <MetricCard label="Approved" value={money(approved)} icon={WalletIcon} />
        <MetricCard label="Pending" value={money(pending)} icon={WalletIcon} />
      </CompactStatGrid>

      <SectionCard title="Expense Records">
        <ExcelDataGrid
          columns={columns}
          rows={payments}
          isLoading={isLoading}
          emptyTitle="No expenses recorded for this project."
          maxHeightClassName="max-h-[480px]"
        />
      </SectionCard>
    </div>
  );
}
