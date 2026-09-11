"use client";

import { ChartBarIcon, ClipboardTextIcon, MapPinIcon, PackageIcon, UsersThreeIcon } from "@phosphor-icons/react";
import type { ColumnDef } from "@/components/shared/DataTable";
import { DataTable } from "@/components/shared/DataTable";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge, type StatusValue } from "@/components/shared/StatusBadge";
import { money } from "@/features/commercial/utils/format";
import { useProjectSummaryQuery } from "@/features/projects/hooks/useProjects";
import { formatCompactCount, formatFractionStat } from "@/lib/format";
import type { Project } from "../../types/project.types";
import { formatDate, toTitleCase } from "./project-detail.utils";

export function ProjectOverviewTab({ project }: { project: Project }) {
  const { data: summary, isLoading } = useProjectSummaryQuery(project.id);

  const info = [
    ["Client", project.client],
    ["Consultant", project.consultant],
    ["Contractor", project.contractor],
    ["Project Type", project.projectType],
    ["City", project.city],
    ["Start Date", formatDate(project.startDate)],
    ["Planned End Date", formatDate(project.plannedEndDate)],
    ["Project Manager", project.assignedManager],
  ];

  if (isLoading || !summary) {
    return (
      <div className="space-y-5">
        <SectionCard title="Project Information">
          <InfoGrid items={info} />
        </SectionCard>
        <p className="px-1 text-sm text-muted-foreground">Loading project summary...</p>
      </div>
    );
  }

  const siteColumns: ColumnDef<(typeof summary.sites.list)[number]>[] = [
    { key: "name", header: "Site / Area", render: (site) => <span className="font-medium text-foreground">{site.name}</span> },
    { key: "status", header: "Status", render: (site) => <StatusBadge status={toTitleCase(site.status) as StatusValue} /> },
    { key: "supervisorName", header: "Supervisor", render: (site) => site.supervisorName || "-" },
    { key: "plannedConnections", header: "Planned Connections", render: (site) => site.plannedConnections ?? "-" },
    { key: "customerCount", header: "Customers", render: (site) => site.customerCount },
  ];

  return (
    <div className="space-y-5">
      <SectionCard title="Project Information">
        <InfoGrid items={info} />
      </SectionCard>

      <SectionCard title="Project Health">
        <CompactStatGrid>
          <MetricCard label="Total Customers" value={formatCompactCount(summary.customers.total)} icon={UsersThreeIcon} />
          <MetricCard label="Active Sites" value={formatFractionStat(summary.sites.active, summary.sites.total)} icon={MapPinIcon} />
          <MetricCard label="DPR Pending" value={formatCompactCount(summary.dpr.pending)} icon={ClipboardTextIcon} />
          <MetricCard label="Stock Alerts" value={formatCompactCount(summary.materials.lowStockAlerts)} icon={PackageIcon} />
        </CompactStatGrid>
      </SectionCard>

      <SectionCard title="Execution Progress">
        <CompactStatGrid columns={5}>
          <MetricCard
            label="Survey Done"
            value={formatFractionStat(summary.customers.surveyDone, summary.customers.total)}
            icon={ChartBarIcon}
          />
          <MetricCard
            label="GI Done"
            value={formatFractionStat(summary.customers.giDone, summary.customers.total)}
            icon={ChartBarIcon}
          />
          <MetricCard
            label="GC Done"
            value={formatFractionStat(summary.customers.gcDone, summary.customers.total)}
            icon={ChartBarIcon}
          />
          <MetricCard
            label="Conversion Done"
            value={formatFractionStat(summary.customers.conversionDone, summary.customers.total)}
            icon={ChartBarIcon}
          />
          <MetricCard
            label="JMR Done"
            value={formatFractionStat(summary.customers.jmrDone, summary.customers.total)}
            icon={ChartBarIcon}
          />
        </CompactStatGrid>
      </SectionCard>

      <SectionCard title="Financial Summary">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contract</p>
            <KeyValueGrid
              columns={1}
              compact
              items={[
                { label: "Contract Value", value: project.contractValue || "-" },
                { label: "Approved Expenses", value: money(summary.expenses.total) },
              ]}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Work Billing Status</p>
            <KeyValueGrid
              columns={1}
              compact
              items={[
                { label: "JMR Done", value: `${summary.customers.jmrDone} / ${summary.customers.total}` },
                { label: "GI Billed", value: `${summary.customers.giBillDone} / ${summary.customers.total}` },
                { label: "GC Billed", value: `${summary.customers.gcBillDone} / ${summary.customers.total}` },
                {
                  label: "Conversion Billed",
                  value: `${summary.customers.conversionBillDone} / ${summary.customers.total}`,
                },
              ]}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Sites">
        {summary.sites.list.length === 0 ? (
          <EmptyRow>No sites added to this project yet.</EmptyRow>
        ) : (
          <DataTable
            columns={siteColumns}
            data={summary.sites.list}
            variant="striped"
            emptyTitle="No sites added to this project yet."
          />
        )}
      </SectionCard>
    </div>
  );
}

function InfoGrid({ items }: { items: (string | undefined)[][] }) {
  return <KeyValueGrid items={items.map(([label, value]) => ({ label: label ?? "", value }))} columns={2} />;
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="px-1 py-6 text-center text-sm text-muted-foreground">{children}</p>;
}
