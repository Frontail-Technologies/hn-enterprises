"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CaretRightIcon,
  CurrencyInrIcon,
  PathIcon,
  ReceiptIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { DetailRows, ProgressList } from "@/components/shared/record";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { ScrollableTabsList } from "@/components/shared/ScrollableTabsList";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge, type StatusValue } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { money } from "@/features/commercial/utils/format";
import { CustomersList } from "@/features/customers/components/CustomersList";
import { PaymentsExpensesPage } from "@/features/commercial/components/PaymentsExpensesPage";
import { useProjectSummaryQuery } from "@/features/projects/hooks/useProjects";
import { formatCompactCount } from "@/lib/format";
import type { Project, ProjectSummary } from "../../types/project.types";
import { ProjectDocumentsTab } from "./ProjectDocumentsTab";
import { ProjectMaterialTab } from "./ProjectMaterialTab";
import { ProjectPlanningTab } from "./ProjectPlanningTab";
import { ProjectActivityTab } from "./ProjectActivityTab";
import { ProjectTeamTab } from "./ProjectTeamTab";
import { ProjectWorkTab } from "./ProjectWorkTab";
import { formatDate, toTitleCase } from "./project-detail.utils";

type ProjectSite = ProjectSummary["sites"]["list"][number];

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "customers", label: "Customers" },
  { value: "work", label: "Work" },
  { value: "planning", label: "Planning" },
  { value: "material", label: "Material" },
  { value: "billing", label: "Billing" },
  { value: "expenses", label: "Expenses" },
  { value: "team", label: "Team" },
  { value: "activity", label: "Activity" },
  { value: "sites", label: "Sites" },
  { value: "documents", label: "Documents" },
] as const;
type TabValue = (typeof TABS)[number]["value"];

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

/** Shown in place of the work/billing figures until the backend provides them. */
function NeedsBackendUpdate() {
  return (
    <p className="rounded-lg bg-muted/50 px-3 py-2 text-[13px] text-muted-foreground">
      These figures appear once the server is updated.
    </p>
  );
}

/**
 * Project workspace, one tab per area so nothing is repeated:
 * Overview (headline numbers and progress), Customers (the full list),
 * Work (LMC / GI laid, DPR, stock), Billing (amounts), Sites, Documents.
 * The open tab is kept in the address (`?tab=`) so refresh and shared links keep it.
 */
export function ProjectTabs({ project }: { project: Project }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  // Old links used ?tab=dpr for what is now the Planning tab.
  const requestedTab = requested === "dpr" ? "planning" : requested;
  const tab: TabValue = TABS.some((entry) => entry.value === requestedTab) ? (requestedTab as TabValue) : "overview";

  const { data: summary, isLoading } = useProjectSummaryQuery(project.id);
  const siteList = useListState({ pageSize: 25, storageKey: "project-sites" });
  const sites = useClientRows(summary?.sites.list ?? [], siteList, { columns: siteColumns });

  const scoped = (path: string) => `${path}?projectId=${encodeURIComponent(project.id)}`;
  // Same drill-down pages as the dashboard stats (customers with their status
  // for that stage, exportable), limited to this project.
  const stage = (statKey: string) => `/dashboard/stats/${statKey}?projectId=${encodeURIComponent(project.id)}`;

  function selectTab(next: TabValue) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const total = summary?.customers.total ?? 0;
  const work = summary?.work;

  return (
    <Tabs value={tab} onValueChange={(value) => value && selectTab(value as TabValue)} className="min-w-0 gap-5">
      <ScrollableTabsList>
        {TABS.map((entry) => (
          <TabsTrigger key={entry.value} value={entry.value} className="shrink-0">
            {entry.label}
            {entry.value === "customers" && summary ? <span className="ms-1 text-muted-foreground tabular-nums">{formatCompactCount(total)}</span> : null}
            {entry.value === "planning" && summary?.dpr.plans?.awaitingApproval ? (
              <span className="ms-1 rounded-full bg-warning-soft px-1.5 text-[11px] font-semibold text-warning-foreground tabular-nums">{summary.dpr.plans.awaitingApproval}</span>
            ) : null}
            {entry.value === "sites" && summary ? <span className="ms-1 text-muted-foreground tabular-nums">{formatCompactCount(summary.sites.total)}</span> : null}
          </TabsTrigger>
        ))}
      </ScrollableTabsList>

      <TabsContent value="overview">
        <div className="flex flex-col gap-5">
          <SectionCard title="Project details">
            <KeyValueGrid
              columns={3}
              items={[
                { label: "Project code", value: project.code },
                { label: "Status", value: <StatusBadge status={project.status as StatusValue} /> },
                { label: "Project type", value: project.projectType },
                { label: "Client", value: project.client },
                { label: "Consultant", value: project.consultant },
                { label: "Contractor", value: project.contractor },
                { label: "City", value: project.city },
                { label: "Area", value: project.area },
                { label: "Manager", value: project.assignedManager },
                { label: "Start date", value: project.startDate ? formatDate(project.startDate) : "" },
                { label: "Planned end", value: project.plannedEndDate ? formatDate(project.plannedEndDate) : "" },
                { label: "Contract value", value: project.contractValue },
              ]}
            />
            {project.description ? <p className="mt-4 border-t border-border pt-3 text-sm text-foreground/80">{project.description}</p> : null}
          </SectionCard>
          {isLoading || !summary ? (
            <>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-26 rounded-card" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-card" />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <RecordTile href={stage("total-customers")}>
                  <DashboardStatCard dense tone="primary" label="Customers" value={formatCompactCount(total)} helperText="See customers & status" icon={UsersThreeIcon} />
                </RecordTile>
                <RecordTile href={`/projects/${project.id}?tab=work`}>
                  <DashboardStatCard dense tone="info" label="LMC laid" value={work ? metres(work.lmc.totalMetres) : "—"} helperText="By pipe size" icon={PathIcon} />
                </RecordTile>
                <RecordTile href={`/projects/${project.id}?tab=billing`}>
                  <DashboardStatCard
                    dense
                    tone="success"
                    label="Billed"
                    value={work ? money(work.billing.billed) : "—"}
                    helperText={work ? `${money(work.billing.outstanding)} outstanding` : "Billing amounts"}
                    icon={ReceiptIcon}
                  />
                </RecordTile>
                <RecordTile href={`/projects/${project.id}?tab=expenses`}>
                  <DashboardStatCard dense tone="warning" label="Approved expenses" value={money(summary.expenses.total)} helperText="Open expenses" icon={CurrencyInrIcon} />
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
                <SectionCard title="Billing status" description="Customers billed per stage · click a row to see them">
                  <ProgressList
                    items={[
                      { label: "GI billed", value: summary.customers.giBillDone, total, href: stage("gi-bill-done") },
                      { label: "GC billed", value: summary.customers.gcBillDone, total, href: stage("gc-bill-done") },
                      { label: "Conversion billed", value: summary.customers.conversionBillDone, total, href: stage("conversion-bill-done") },
                    ]}
                  />
                </SectionCard>
              </div>
            </>
          )}
        </div>
      </TabsContent>

      <TabsContent value="customers">
        {/* Mounted only while open, so the full list isn't fetched for other tabs. */}
        {tab === "customers" ? <CustomersList projectId={project.id} embedded /> : null}
      </TabsContent>

      <TabsContent value="work">
        {summary ? <ProjectWorkTab project={project} summary={summary} /> : <Skeleton className="h-64 rounded-card" />}
      </TabsContent>

      <TabsContent value="planning">
        {tab === "planning" ? <ProjectPlanningTab projectId={project.id} summary={summary} /> : null}
      </TabsContent>

      <TabsContent value="material">
        {tab === "material" ? <ProjectMaterialTab projectId={project.id} /> : null}
      </TabsContent>

      <TabsContent value="billing">
        <SectionCard
          title="Billing amounts"
          action={
            <Link href={scoped("/billing")} className="text-[13px] font-medium text-primary hover:underline">
              Open bills
            </Link>
          }
          className="max-w-2xl"
        >
          {work ? (
            <DetailRows
              rows={[
                { label: "Total billed", value: money(work.billing.billed) },
                { label: "Received", value: money(work.billing.paid) },
                { label: "Outstanding", value: money(work.billing.outstanding) },
                { label: "Bills", value: formatCompactCount(work.billing.bills) },
                { label: "Approved expenses", value: money(summary?.expenses.total ?? 0) },
                { label: "Contract value", value: project.contractValue || "—" },
              ]}
            />
          ) : (
            <NeedsBackendUpdate />
          )}
        </SectionCard>
      </TabsContent>

      <TabsContent value="expenses">
        {tab === "expenses" ? <PaymentsExpensesPage projectId={project.id} /> : null}
      </TabsContent>

      <TabsContent value="team">
        {tab === "team" ? <ProjectTeamTab projectId={project.id} /> : null}
      </TabsContent>

      <TabsContent value="activity">
        {tab === "activity" ? <ProjectActivityTab projectId={project.id} /> : null}
      </TabsContent>

      <TabsContent value="sites">
        <ListTable
          itemLabel="site"
          rows={sites.pageRows}
          total={sites.total}
          columns={siteColumns}
          state={siteList}
          searchPlaceholder="Search sites or supervisors..."
          empty={{ illustration: "projects", title: "No sites added to this project yet." }}
        />
      </TabsContent>

      <TabsContent value="documents">
        <ProjectDocumentsTab projectId={project.id} />
      </TabsContent>
    </Tabs>
  );
}
