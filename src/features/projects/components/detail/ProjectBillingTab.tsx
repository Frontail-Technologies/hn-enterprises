"use client";

import { ReceiptIcon } from "@phosphor-icons/react";
import type { ColumnDef } from "@/components/shared/DataTable";
import { DataTable } from "@/components/shared/DataTable";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge, type StatusValue } from "@/components/shared/StatusBadge";
import { BillDialog } from "@/features/commercial/components/billing/BillDialog";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import { formatDate as formatMoneyDate, money } from "@/features/commercial/utils/format";
import { useProjectSummaryQuery } from "@/features/projects/hooks/useProjects";
import { formatFractionStat } from "@/lib/format";
import { ProjectTabHeader } from "./ProjectTabHeader";

export function ProjectBillingTab({
  projectId,
  projectName,
  onDrillDown,
}: {
  projectId: string;
  projectName: string;
  onDrillDown: (statKey: string) => void;
}) {
  const { data: summary, isLoading: summaryLoading } = useProjectSummaryQuery(projectId);
  const { data: bills = [], isLoading: billsLoading } = useBillsQuery({ projectId });

  const billColumns: ColumnDef<(typeof bills)[number]>[] = [
    { key: "billNumber", header: "Bill Number" },
    { key: "billDate", header: "Bill Date", render: (row) => formatMoneyDate(row.billDate) },
    { key: "totalAmount", header: "Total", render: (row) => money(row.totalAmount) },
    { key: "paidAmount", header: "Paid", render: (row) => money(row.paidAmount) },
    { key: "pendingAmount", header: "Pending", render: (row) => money(row.pendingAmount) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as StatusValue} /> },
  ];

  return (
    <div className="space-y-5">
      <ProjectTabHeader
        title="Billing"
        subtitle="Work billing status and bills for this project"
        actions={<BillDialog triggerLabel="Create Bill" defaultProjectId={projectId} defaultProjectName={projectName} />}
      />

      <SectionCard title="Work Billing Status">
        {summaryLoading || !summary ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <CompactStatGrid columns={5}>
            <button type="button" className="text-left" onClick={() => onDrillDown("jmr-done")}>
              <MetricCard
                label="JMR Done"
                value={formatFractionStat(summary.customers.jmrDone, summary.customers.total)}
                icon={ReceiptIcon}
              />
            </button>
            <button type="button" className="text-left" onClick={() => onDrillDown("total-pbg-assignment")}>
              <MetricCard
                label="JMR Submitted in PBG"
                value={formatFractionStat(summary.customers.jmrSubmittedInPbg, summary.customers.total)}
                icon={ReceiptIcon}
              />
            </button>
            <button type="button" className="text-left" onClick={() => onDrillDown("gi-bill-done")}>
              <MetricCard
                label="GI Bill Done"
                value={formatFractionStat(summary.customers.giBillDone, summary.customers.total)}
                icon={ReceiptIcon}
              />
            </button>
            <button type="button" className="text-left" onClick={() => onDrillDown("gc-bill-done")}>
              <MetricCard
                label="GC Bill Done"
                value={formatFractionStat(summary.customers.gcBillDone, summary.customers.total)}
                icon={ReceiptIcon}
              />
            </button>
            <button type="button" className="text-left" onClick={() => onDrillDown("conversion-bill-done")}>
              <MetricCard
                label="Conversion Bill Done"
                value={formatFractionStat(summary.customers.conversionBillDone, summary.customers.total)}
                icon={ReceiptIcon}
              />
            </button>
          </CompactStatGrid>
        )}
      </SectionCard>

      <SectionCard title="Project Bills">
        <DataTable
          columns={billColumns}
          data={bills}
          variant="striped"
          isLoading={billsLoading}
          emptyTitle="No bills recorded for this project yet."
        />
      </SectionCard>
    </div>
  );
}
