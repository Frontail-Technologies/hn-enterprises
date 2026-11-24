"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CaretRightIcon, ClipboardTextIcon, CurrencyInrIcon, MapPinIcon, PackageIcon, ReceiptIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { DetailRows, ProgressList, RecordLayout } from "@/components/shared/record";
import { SectionCard } from "@/components/shared/SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, type StatusValue } from "@/components/shared/StatusBadge";
import { money } from "@/features/commercial/utils/format";
import { useProjectSummaryQuery } from "@/features/projects/hooks/useProjects";
import { formatCompactCount, formatFractionStat } from "@/lib/format";
import type { Project } from "../../types/project.types";
import { formatDate, toTitleCase } from "./project-detail.utils";

type ProjectSite = NonNullable<ReturnType<typeof useProjectSummaryQuery>["data"]>["sites"]["list"][number];

const siteColumns: ListColumn<ProjectSite>[] = [
  { id: "name", header: "Site / area", value: (site) => site.name, isTitle: true, hideable: false, sortable: true, width: 220, grow: true },
  {
    id: "status",
    header: "Status",
    value: (site) => toTitleCase(site.status),
    sortable: true,
    width: 140,
    cell: (site) => <StatusBadge status={toTitleCase(site.status) as StatusValue} />,
  },
  { id: "supervisorName", header: "Supervisor", value: (site) => site.supervisorName || "-", sortable: true, width: 170 },
  { id: "plannedConnections", header: "Planned connections", value: (site) => site.plannedConnections ?? "-", align: "end", sortable: true, width: 170 },
  { id: "customerCount", header: "Customers", value: (site) => site.customerCount, align: "end", sortable: true, width: 120 },
];

const metres = (value: number) => `${value.toLocaleString("en-IN", { maximumFractionDigits: 1 })} m`;

/** GI sizes that have any metres recorded (½" always shown). */
function giRows(gi: NonNullable<NonNullable<ReturnType<typeof useProjectSummaryQuery>["data"]>["work"]>["gi"]) {
  const sizes = [
    { label: 'GI ½"', value: gi.halfInch, always: true },
    { label: 'GI ¾"', value: gi.threeQuarterInch },
    { label: 'GI 1"', value: gi.oneInch },
    { label: 'GI 1½"', value: gi.oneAndHalfInch },
    { label: 'GI 2"', value: gi.twoInch },
  ];
  return sizes.filter((size) => size.always || size.value > 0).map((size) => ({ label: size.label, value: metres(size.value) }));
}

/** A stat tile that opens the full, project-filtered page for that record type. */
function RecordTile({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative block rounded-card outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 [&>article]:transition-colors hover:[&>article]:border-primary/40"
    >
      {children}
      <CaretRightIcon
        size={14}
        aria-hidden="true"
        className="absolute top-3 right-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </Link>
  );
}

/**
 * Project overview: key numbers (each opens the full page filtered to this
 * project), execution and billing progress, sites, and a facts rail. Lists
 * that have their own screens (customers, bills, expenses, materials, DPRs)
 * are linked, not embedded.
 */
export function ProjectOverviewTab({ project, rail, children }: { project: Project; rail?: ReactNode; children?: ReactNode }) {
  const { data: summary, isLoading } = useProjectSummaryQuery(project.id);
  const siteList = useListState({ pageSize: 25, storageKey: "project-sites" });
  const sites = useClientRows(summary?.sites.list ?? [], siteList, { columns: siteColumns });
  const scoped = (path: string) => `${path}?projectId=${encodeURIComponent(project.id)}`;
  // Same drill-down pages as the dashboard stats (customers with their status
  // for that stage, exportable), limited to this project.
  const stage = (statKey: string) => `/dashboard/stats/${statKey}?projectId=${encodeURIComponent(project.id)}`;

  const facts = (
    <>
      <SectionCard title="Project facts">
        <DetailRows
          rows={[
            { label: "Client", value: project.client },
            { label: "Consultant", value: project.consultant },
            { label: "Contractor", value: project.contractor },
            { label: "Project type", value: project.projectType },
            { label: "City", value: project.city },
            { label: "Start date", value: formatDate(project.startDate) },
            { label: "Planned end", value: formatDate(project.plannedEndDate) },
            { label: "Project manager", value: project.assignedManager },
            { label: "Contract value", value: project.contractValue },
          ]}
        />
      </SectionCard>
      {rail}
    </>
  );

  if (isLoading || !summary) {
    return (
      <RecordLayout rail={facts}>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[74px] rounded-card" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-card" />
        {children}
      </RecordLayout>
    );
  }

  const total = summary.customers.total;

  return (
    <RecordLayout rail={facts}>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <RecordTile href={stage("total-customers")}>
          <DashboardStatCard dense tone="primary" label="Customers" value={formatCompactCount(total)} helperText="See customers & status" icon={UsersThreeIcon} />
        </RecordTile>
        <RecordTile href="#sites">
          <DashboardStatCard dense tone="info" label="Active sites" value={formatFractionStat(summary.sites.active, summary.sites.total)} helperText="See sites below" icon={MapPinIcon} />
        </RecordTile>
        <RecordTile href="/planning">
          <DashboardStatCard dense tone="warning" label="DPR pending" value={formatCompactCount(summary.dpr.pending)} helperText="Open DPR / planning" icon={ClipboardTextIcon} />
        </RecordTile>
        <RecordTile href={scoped("/inventory")}>
          <DashboardStatCard dense tone="danger" label="Stock alerts" value={formatCompactCount(summary.materials.lowStockAlerts)} helperText="Open materials" icon={PackageIcon} />
        </RecordTile>
        <RecordTile href={scoped("/payments")}>
          <DashboardStatCard dense tone="success" label="Approved expenses" value={money(summary.expenses.total)} helperText="Open expenses" icon={CurrencyInrIcon} />
        </RecordTile>
        <RecordTile href={scoped("/billing")}>
          <DashboardStatCard dense tone="info" label="JMR billed" value={formatFractionStat(summary.customers.jmrDone, total)} helperText="Open bills" icon={ReceiptIcon} />
        </RecordTile>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Execution progress" description="Customers through each field stage · click a stage to see them">
          <ProgressList
            items={[
              { label: "Survey", value: summary.customers.surveyDone, total, href: stage("survey-done") },
              { label: "GI", value: summary.customers.giDone, total, href: stage("gi-done") },
              { label: "GC", value: summary.customers.gcDone, total, href: stage("gc-done") },
              { label: "Conversion", value: summary.customers.conversionDone, total, href: stage("conversion-done") },
              { label: "JMR", value: summary.customers.jmrDone, total, href: stage("jmr-done") },
            ]}
          />
        </SectionCard>
        <SectionCard title="Billing status" description="Work billed so far · click a row to see the customers">
          <ProgressList
            items={[
              { label: "JMR done", value: summary.customers.jmrDone, total, href: stage("jmr-done") },
              { label: "GI billed", value: summary.customers.giBillDone, total, href: stage("gi-bill-done") },
              { label: "GC billed", value: summary.customers.gcBillDone, total, href: stage("gc-bill-done") },
              { label: "Conversion billed", value: summary.customers.conversionBillDone, total, href: stage("conversion-bill-done") },
            ]}
          />
        </SectionCard>
      </div>

      {summary.work ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard
            title="LMC & GI laid"
            description={
              <>
                Metres recorded on this project&apos;s customers ·{" "}
                <Link href={stage("laying-done")} className="font-medium text-primary hover:underline">
                  see laying status
                </Link>
              </>
            }
          >
            <DetailRows
              rows={[
                ...(summary.work.lmc.bySize.length
                  ? summary.work.lmc.bySize.map((row) => ({
                      label: `LMC ${row.pipeSize}`,
                      value: `${metres(row.metres)} · ${formatCompactCount(row.customers)} customers`,
                    }))
                  : [{ label: "LMC pipe", value: "No LMC recorded yet" }]),
                { label: "Total LMC", value: metres(summary.work.lmc.totalMetres) },
                ...giRows(summary.work.gi),
                { label: "Total GI", value: metres(summary.work.gi.totalMetres) },
              ]}
            />
          </SectionCard>
          <SectionCard
            title="Billing amounts"
            description={
              <>
                Bills raised on this project (drafts excluded) ·{" "}
                <Link href={scoped("/billing")} className="font-medium text-primary hover:underline">
                  open bills
                </Link>
              </>
            }
          >
            <DetailRows
              rows={[
                { label: "Total billed", value: money(summary.work.billing.billed) },
                { label: "Received", value: money(summary.work.billing.paid) },
                { label: "Outstanding", value: money(summary.work.billing.outstanding) },
                { label: "Bills", value: formatCompactCount(summary.work.billing.bills) },
                { label: "Approved expenses", value: money(summary.expenses.total) },
              ]}
            />
          </SectionCard>
        </div>
      ) : null}

      <section id="sites" className="flex scroll-mt-24 flex-col gap-3">
        <h2 className="text-section-title">Sites</h2>
        <ListTable
          itemLabel="site"
          rows={sites.pageRows}
          total={sites.total}
          columns={siteColumns}
          state={siteList}
          searchPlaceholder="Search sites or supervisors..."
          empty={{ illustration: "projects", title: "No sites added to this project yet." }}
        />
      </section>

      {children}
    </RecordLayout>
  );
}
