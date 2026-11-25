"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardTextIcon, PackageIcon, PathIcon, PipeIcon } from "@phosphor-icons/react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailRows, ProgressList } from "@/components/shared/record";
import { SectionCard } from "@/components/shared/SectionCard";
import { formatCompactCount } from "@/lib/format";
import type { Project, ProjectSummary } from "../../types/project.types";

const FIELD_STAGES: { key: string; label: string }[] = [
  { key: "survey-done", label: "Survey" },
  { key: "laying-done", label: "Laying" },
  { key: "flushing-testing-done", label: "Flushing / Testing" },
  { key: "pre-commissioning-done", label: "Pre-commissioning" },
  { key: "gi-done", label: "GI" },
  { key: "gc-done", label: "GC" },
  { key: "valve-chamber-done", label: "Valve chamber" },
  { key: "route-marker-done", label: "Route marker" },
  { key: "pole-marker-done", label: "Pole marker" },
  { key: "commissioning", label: "Commissioning" },
  { key: "conversion-done", label: "Conversion" },
  { key: "jmr-done", label: "JMR" },
];

const metres = (value: number) => `${value.toLocaleString("en-IN", { maximumFractionDigits: 1 })} m`;
const pipeLabel = (size: string) => size.replace("_", " ").replace("other", "Other");

/**
 * What has been done on site: metres laid, every field stage (click a stage
 * for the customers and their status), LMC/GI by size and progress per site.
 */
export function ProjectWorkTab({ project, summary }: { project: Project; summary: ProjectSummary }) {
  const router = useRouter();
  const stage = (statKey: string) => `/dashboard/stats/${statKey}?projectId=${encodeURIComponent(project.id)}`;
  const scoped = (path: string) => `${path}?projectId=${encodeURIComponent(project.id)}`;
  const total = summary.customers.total;
  const work = summary.work;
  const stages = summary.customers.stages ?? {};
  const sites = work?.bySite ?? [];

  const cards = (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <DashboardStatCard dense tone="info" label="LMC laid" value={work ? metres(work.lmc.totalMetres) : "—"} icon={PathIcon} />
      <DashboardStatCard dense tone="primary" label="GI laid" value={work ? metres(work.gi.totalMetres) : "—"} icon={PipeIcon} />
      <Link href={`${scoped("/planning")}&tab=approval`} className="block rounded-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <DashboardStatCard
          dense
          tone="warning"
          label="DPR awaiting approval"
          value={formatCompactCount(summary.dpr.awaitingApproval ?? summary.dpr.pending)}
          icon={ClipboardTextIcon}
        />
      </Link>
      <Link href={scoped("/inventory")} className="block rounded-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <DashboardStatCard dense tone="danger" label="Stock alerts" value={formatCompactCount(summary.materials.lowStockAlerts)} icon={PackageIcon} />
      </Link>
    </div>
  );

  if (!total) {
    return (
      <div className="flex flex-col gap-5">
        {cards}
        <div className="rounded-card border border-border bg-card shadow-card">
          <EmptyState
            illustration="customers"
            title="No customers in this project yet"
            description="Field work, metres laid and site progress appear here once customers are added."
            action={{ label: "Import customers", onClick: () => router.push(`/customers/import?projectId=${encodeURIComponent(project.id)}`) }}
          />
        </div>
      </div>
    );
  }

  const half = Math.ceil(FIELD_STAGES.length / 2);
  const stageItems = FIELD_STAGES.map((item) => ({ label: item.label, value: stages[item.key] ?? 0, total, href: stage(item.key) }));

  return (
    <div className="flex flex-col gap-5">
      {cards}

      <SectionCard title="Field work">
        <div className="grid gap-x-8 lg:grid-cols-2">
          <ProgressList items={stageItems.slice(0, half)} />
          <ProgressList items={stageItems.slice(half)} />
        </div>
      </SectionCard>

      <SectionCard
        title="Daily progress reports (DPR)"
        action={
          <Link href={`${scoped("/planning")}&tab=approval`} className="text-[13px] font-medium text-primary hover:underline">
            Review DPRs
          </Link>
        }
      >
        <DetailRows
          rows={[
            { label: "Awaiting approval", value: formatCompactCount(summary.dpr.awaitingApproval ?? 0) },
            { label: "Approved", value: formatCompactCount(summary.dpr.approved ?? 0) },
            { label: "Not submitted yet", value: formatCompactCount(summary.dpr.drafts ?? 0) },
            { label: "Sent back to supervisor", value: formatCompactCount(summary.dpr.sentBack ?? 0) },
            { label: "Submitted this month", value: formatCompactCount(summary.dpr.submittedThisMonth) },
          ]}
        />
      </SectionCard>

      {work ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard
            title="LMC by pipe size"
            action={
              <Link href={stage("laying-done")} className="text-[13px] font-medium text-primary hover:underline">
                Laying status
              </Link>
            }
          >
            <DetailRows
              rows={[
                ...(work.lmc.bySize.length
                  ? work.lmc.bySize.map((row) => ({
                      label: pipeLabel(row.pipeSize),
                      value: `${metres(row.metres)} · ${formatCompactCount(row.customers)} customers`,
                    }))
                  : [{ label: "LMC", value: "No LMC recorded yet" }]),
                { label: "Total", value: metres(work.lmc.totalMetres) },
              ]}
            />
          </SectionCard>
          <SectionCard title="GI by size">
            <DetailRows
              rows={[
                { label: '½"', value: metres(work.gi.halfInch) },
                ...(work.gi.threeQuarterInch ? [{ label: '¾"', value: metres(work.gi.threeQuarterInch) }] : []),
                ...(work.gi.oneInch ? [{ label: '1"', value: metres(work.gi.oneInch) }] : []),
                ...(work.gi.oneAndHalfInch ? [{ label: '1½"', value: metres(work.gi.oneAndHalfInch) }] : []),
                ...(work.gi.twoInch ? [{ label: '2"', value: metres(work.gi.twoInch) }] : []),
                { label: "Total", value: metres(work.gi.totalMetres) },
              ]}
            />
          </SectionCard>
        </div>
      ) : null}

      {sites.length ? (
        <SectionCard title="Progress by site">
          <div className="-mx-5 -mb-5 overflow-x-auto border-t border-border">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead className="bg-surface-muted text-left text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-5 py-2">Site / area</th>
                  <th className="px-3 py-2 text-right">Customers</th>
                  <th className="px-3 py-2 text-right">Survey</th>
                  <th className="px-3 py-2 text-right">GI</th>
                  <th className="px-3 py-2 text-right">GC</th>
                  <th className="px-3 py-2 text-right">Conversion</th>
                  <th className="px-3 py-2 text-right">LMC</th>
                  <th className="px-5 py-2 text-right">GI pipe</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {sites.map((site) => (
                  <tr key={site.id} className="border-t border-border">
                    <td className="px-5 py-2 font-medium">{site.name || "Unnamed site"}</td>
                    <td className="px-3 py-2 text-right">{formatCompactCount(site.customers)}</td>
                    <td className="px-3 py-2 text-right">{site.surveyDone}</td>
                    <td className="px-3 py-2 text-right">{site.giDone}</td>
                    <td className="px-3 py-2 text-right">{site.gcDone}</td>
                    <td className="px-3 py-2 text-right">{site.conversionDone}</td>
                    <td className="px-3 py-2 text-right">{metres(site.lmcMetres)}</td>
                    <td className="px-5 py-2 text-right">{metres(site.giMetres)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
