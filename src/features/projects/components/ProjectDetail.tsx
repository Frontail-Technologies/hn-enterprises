"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChartBarIcon,
  ClipboardTextIcon,
  DownloadSimpleIcon,
  EyeIcon,
  FileArrowUpIcon,
  MapPinIcon,
  NotePencilIcon,
  PackageIcon,
  ReceiptIcon,
  TrashIcon,
  UserGearIcon,
  UsersThreeIcon,
  WalletIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ActionButton } from "@/components/shared/ActionButton";
import { resolveFileUrl, uploadFile } from "@/lib/upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DatePicker } from "@/components/shared/DatePicker";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { FormField } from "@/components/shared/FormField";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageLoading } from "@/components/shared/PageLoading";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge, type StatusValue } from "@/components/shared/StatusBadge";
import { CustomersList } from "@/features/customers/components/CustomersList";
import { BillDrawer } from "@/features/commercial/components/billing/BillDrawer";
import { PaymentDrawer } from "@/features/commercial/components/PaymentsExpensesPage";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import { useMaterialsQuery, useMaterialTransactionsQuery } from "@/features/commercial/hooks/useMaterials";
import { useDeletePayment, usePaymentsQuery } from "@/features/commercial/hooks/usePayments";
import { formatDate as formatMoneyDate, money } from "@/features/commercial/utils/format";
import { useDprRecordsQuery } from "@/features/planning/hooks/usePlanning";
import { useAuditLogsQuery } from "@/features/management/hooks/useAuditLogs";
import { useWorkProgressQueueQuery } from "@/features/work-progress/hooks/useWorkProgress";
import {
  useProjectDocumentsQuery,
  useProjectQuery,
  useProjectSummaryQuery,
  useProjectTeamQuery,
  useCreateProjectDocument,
  useDeleteProjectDocument,
} from "@/features/projects/hooks/useProjects";
import type { Project, ProjectDocument, ProjectTeam } from "../types/project.types";

const documentCategories = [
  { type: "Contract", label: "Contract", numberLabel: "Contract No.", amountLabel: "Contract Amount" },
  { type: "Work Order", label: "Work Order", numberLabel: "WO No.", amountLabel: "WO Amount" },
  { type: "BOQ", label: "BOQ", numberLabel: "BOQ No.", amountLabel: "Amount" },
  { type: "Drawing", label: "Drawing", numberLabel: "Drawing No.", amountLabel: "Amount" },
  { type: "Billing", label: "Billing", numberLabel: "Reference No.", amountLabel: "Amount" },
  { type: "Approval", label: "Approval", numberLabel: "Reference No.", amountLabel: "Amount" },
  { type: "Other", label: "Other", numberLabel: "Reference No.", amountLabel: "Amount" },
];

const SECTIONS = [
  { value: "overview", label: "Overview" },
  { value: "customers", label: "Customers" },
  { value: "execution", label: "Execution" },
  { value: "billing", label: "Billing" },
  { value: "expenses", label: "Expenses" },
  { value: "materials", label: "Materials" },
  { value: "team", label: "Team" },
  { value: "documents", label: "Documents" },
  { value: "activity", label: "Activity" },
] as const;

type Section = (typeof SECTIONS)[number]["value"];
const SECTION_VALUES = SECTIONS.map((item) => item.value) as string[];

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data: project, isLoading, isError } = useProjectQuery(projectId);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Overrides the raw UUID the global breadcrumb would otherwise show for
  // this dynamic route segment - no second, duplicate breadcrumb needed here.
  useBreadcrumbLabel(project?.name);

  const rawSection = searchParams.get("section");
  const section: Section = (SECTION_VALUES.includes(rawSection ?? "") ? rawSection : "overview") as Section;

  function setSection(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", next);
    // A tab switch is a real navigation event here (not incidental state),
    // so it's pushed (not replaced) - back/forward moves between sections (§23).
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !project) {
    return <p className="p-4 text-sm text-destructive">Unable to load this project.</p>;
  }

  const metaItems = [project.code, project.city, project.client, project.projectType].filter(Boolean);

  return (
    <div className="space-y-3">
      <DetailHeader
        title={project.name}
        badges={<StatusBadge status={project.status} />}
        meta={
          metaItems.length > 0 ? (
            <span>{metaItems.join(" · ")}</span>
          ) : null
        }
        actions={
          <Link href={`/projects/${project.id}/edit`} className={buttonVariants({ variant: "outline", size: "default" })}>
            <NotePencilIcon size={15} />
            Edit Project
          </Link>
        }
      />

      <Tabs value={section} onValueChange={(value) => value && setSection(value)} className="gap-3">
        <div className="sticky top-0 z-40 -mx-1 border-b border-border bg-background px-1 backdrop-blur">
          <TabsList variant="line" className="flex w-max min-w-full justify-start gap-6 overflow-x-auto">
            {SECTIONS.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="h-10 flex-none rounded-none px-0.5 py-0 font-medium"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview">
          <ProjectOverviewTab project={project} />
        </TabsContent>
        <TabsContent value="customers">
          <ProjectCustomersTab projectId={project.id} onClearStatKey={() => setSection("customers")} />
        </TabsContent>
        <TabsContent value="execution">
          <ProjectExecutionTab projectId={project.id} />
        </TabsContent>
        <TabsContent value="billing">
          <ProjectBillingTab
            projectId={project.id}
            projectName={project.name}
            onDrillDown={(statKey) => navigateToCustomersStatKey(router, pathname, statKey)}
          />
        </TabsContent>
        <TabsContent value="expenses">
          <ProjectExpensesTab projectId={project.id} projectName={project.name} />
        </TabsContent>
        <TabsContent value="materials">
          <ProjectMaterialsTab projectId={project.id} />
        </TabsContent>
        <TabsContent value="team">
          <ProjectTeamTab projectId={project.id} active={section === "team"} />
        </TabsContent>
        <TabsContent value="documents">
          <ProjectDocumentsTab projectId={project.id} />
        </TabsContent>
        <TabsContent value="activity">
          <ProjectActivityTab projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function navigateToCustomersStatKey(router: ReturnType<typeof useRouter>, pathname: string, statKey: string) {
  const params = new URLSearchParams();
  params.set("section", "customers");
  params.set("statKey", statKey);
  router.push(`${pathname}?${params.toString()}`, { scroll: false });
}

// One consistent header pattern for every tab's content (§26) - title +
// optional subtitle on the left, primary action top-right - so no section
// invents its own spacing.
function ProjectTabHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function ProjectOverviewTab({ project }: { project: Project }) {
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
          <MetricCard label="Total Customers" value={summary.customers.total} icon={UsersThreeIcon} />
          <MetricCard label="Active Sites" value={`${summary.sites.active}/${summary.sites.total}`} icon={MapPinIcon} />
          <MetricCard label="DPR Pending" value={summary.dpr.pending} icon={ClipboardTextIcon} />
          <MetricCard label="Stock Alerts" value={summary.materials.lowStockAlerts} icon={PackageIcon} />
        </CompactStatGrid>
      </SectionCard>

      <SectionCard title="Execution Progress">
        <CompactStatGrid columns={5}>
          <MetricCard
            label="Survey Done"
            value={`${summary.customers.surveyDone} / ${summary.customers.total}`}
            icon={ChartBarIcon}
          />
          <MetricCard
            label="GI Done"
            value={`${summary.customers.giDone} / ${summary.customers.total}`}
            icon={ChartBarIcon}
          />
          <MetricCard
            label="GC Done"
            value={`${summary.customers.gcDone} / ${summary.customers.total}`}
            icon={ChartBarIcon}
          />
          <MetricCard
            label="Conversion Done"
            value={`${summary.customers.conversionDone} / ${summary.customers.total}`}
            icon={ChartBarIcon}
          />
          <MetricCard
            label="JMR Done"
            value={`${summary.customers.jmrDone} / ${summary.customers.total}`}
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

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

function ProjectCustomersTab({ projectId, onClearStatKey }: { projectId: string; onClearStatKey: () => void }) {
  const searchParams = useSearchParams();
  const statKey = searchParams.get("statKey") ?? undefined;

  return (
    <div className="space-y-3">
      {statKey ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
          <span>
            Showing customers matching <span className="font-semibold">{statKey}</span>
          </span>
          <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={onClearStatKey}>
            <XIcon size={12} />
            Clear filter
          </Button>
        </div>
      ) : null}
      <CustomersList projectId={projectId} statKey={statKey} embedded />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

function ProjectExecutionTab({ projectId }: { projectId: string }) {
  const { data: dprRecords = [], isLoading: dprLoading } = useDprRecordsQuery({ projectId });
  const { data: queueRows = [], isLoading: queueLoading } = useWorkProgressQueueQuery({ projectId });

  const dprSubmitted = dprRecords.filter((row) => row.status !== "Draft").length;
  const dprPending = dprRecords.filter((row) => row.status === "Draft").length;
  const giCompleted = queueRows.filter((row) => row.stage === "Plumbing / GI" && row.status === "Completed").length;
  const gcCompleted = queueRows.filter((row) => row.stage === "GC" && row.status === "Completed").length;
  const conversions = queueRows.filter((row) => row.stage === "Conversion" && row.status === "Completed").length;

  const queueColumns: ExcelColumn<import("@/features/work-progress/types/work-progress.types").WorkQueueRow>[] = [
    { key: "customerName", label: "Customer", width: 190, sticky: true, getValue: (row) => row.customerName },
    { key: "trBpNumber", label: "TR/BP No.", width: 140, getValue: (row) => row.trBpNumber },
    { key: "site", label: "Site", width: 150, getValue: (row) => row.site?.name ?? "" },
    { key: "stage", label: "Stage", width: 150, getValue: (row) => row.stage },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status as StatusValue} />,
    },
    { key: "nextRequiredAction", label: "Next Action", width: 220, getValue: (row) => row.nextRequiredAction },
    { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor?.name ?? "" },
    { key: "lastUpdated", label: "Last Updated", width: 140, getValue: (row) => formatDate(row.lastUpdated) },
  ];

  const dprColumns: ColumnDef<(typeof dprRecords)[number]>[] = [
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "site", header: "Site", render: (row) => row.siteLabel },
    { key: "supervisor", header: "Supervisor", render: (row) => row.supervisorName },
    { key: "tasks", header: "Tasks Logged", render: (row) => row.tasks.length },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as StatusValue} /> },
    { key: "remarks", header: "Remarks", render: (row) => row.remarks || "-" },
  ];

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Execution" subtitle="Field progress and daily reports for this project" />

      <SectionCard title="Execution Summary">
        <CompactStatGrid columns={3}>
          <MetricCard label="Customers Worked On" value={queueRows.length} icon={UsersThreeIcon} />
          <MetricCard label="GI Completed" value={giCompleted} icon={ChartBarIcon} />
          <MetricCard label="GC Completed" value={gcCompleted} icon={ChartBarIcon} />
          <MetricCard label="Conversions" value={conversions} icon={ChartBarIcon} />
          <MetricCard label="DPR Submitted" value={dprSubmitted} icon={ClipboardTextIcon} />
          <MetricCard label="DPR Pending" value={dprPending} icon={ClipboardTextIcon} />
        </CompactStatGrid>
      </SectionCard>

      <SectionCard title="Work Progress (Work Queue)">
        <ExcelDataGrid
          columns={queueColumns}
          rows={queueRows}
          isLoading={queueLoading}
          emptyTitle="No work progress recorded for this project yet."
          maxHeightClassName="max-h-[420px]"
        />
      </SectionCard>

      <SectionCard title="DPR Reports">
        <DataTable
          columns={dprColumns}
          data={dprRecords}
          variant="striped"
          isLoading={dprLoading}
          emptyTitle="No DPR reports found for this project."
        />
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Billing (Phase 1 - read-only existing indicators, no project-level billing yet)
// ---------------------------------------------------------------------------

function ProjectBillingTab({
  projectId,
  projectName,
  onDrillDown,
}: {
  projectId: string;
  projectName: string;
  onDrillDown: (statKey: string) => void;
}) {
  const { data: summary, isLoading: summaryLoading } = useProjectSummaryQuery(projectId);
  // Bills are project-linked - filtered server-side by project.
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
        actions={<BillDrawer triggerLabel="Create Bill" defaultProjectId={projectId} defaultProjectName={projectName} />}
      />

      <SectionCard title="Work Billing Status">
        {summaryLoading || !summary ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <CompactStatGrid columns={5}>
            <button type="button" className="text-left" onClick={() => onDrillDown("jmr-done")}>
              <MetricCard
                label="JMR Done"
                value={`${summary.customers.jmrDone} / ${summary.customers.total}`}
                icon={ReceiptIcon}
              />
            </button>
            <button type="button" className="text-left" onClick={() => onDrillDown("total-pbg-assignment")}>
              <MetricCard
                label="JMR Submitted in PBG"
                value={`${summary.customers.jmrSubmittedInPbg} / ${summary.customers.total}`}
                icon={ReceiptIcon}
              />
            </button>
            <button type="button" className="text-left" onClick={() => onDrillDown("gi-bill-done")}>
              <MetricCard
                label="GI Bill Done"
                value={`${summary.customers.giBillDone} / ${summary.customers.total}`}
                icon={ReceiptIcon}
              />
            </button>
            <button type="button" className="text-left" onClick={() => onDrillDown("gc-bill-done")}>
              <MetricCard
                label="GC Bill Done"
                value={`${summary.customers.gcBillDone} / ${summary.customers.total}`}
                icon={ReceiptIcon}
              />
            </button>
            <button type="button" className="text-left" onClick={() => onDrillDown("conversion-bill-done")}>
              <MetricCard
                label="Conversion Bill Done"
                value={`${summary.customers.conversionBillDone} / ${summary.customers.total}`}
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

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

function ProjectExpensesTab({ projectId, projectName }: { projectId: string; projectName: string }) {
  const { data: payments = [], isLoading } = usePaymentsQuery({ projectId });
  const deletePayment = useDeletePayment();

  const total = payments.reduce((sum, row) => sum + row.amount, 0);
  const approved = payments.filter((row) => row.status === "Approved").reduce((sum, row) => sum + row.amount, 0);
  const pending = payments
    .filter((row) => row.status === "Draft" || row.status === "Submitted")
    .reduce((sum, row) => sum + row.amount, 0);

  const columns: ExcelColumn<(typeof payments)[number]>[] = [
    { key: "category", label: "Category", width: 180, sticky: true, getValue: (row) => row.category },
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
      key: "actions",
      label: "Actions",
      width: 110,
      getValue: () => "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <PaymentDrawer payment={row} iconOnly />
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
        actions={<PaymentDrawer defaultProjectId={projectId} defaultProjectName={projectName} />}
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

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  purchase: "Purchase",
  pbg_issue: "PBG Issue",
  pbg_consumption: "PBG Consumption",
  issue: "Issue",
  return: "Return",
  adjustment: "Adjustment",
  consumption: "Consumption",
};

function ProjectMaterialsTab({ projectId }: { projectId: string }) {
  const { data: transactions = [], isLoading } = useMaterialTransactionsQuery({ projectId });
  const { data: materials = [] } = useMaterialsQuery();
  const materialNameById = useMemo(() => new Map(materials.map((material) => [material.id, material.name])), [materials]);

  const perMaterial = useMemo(() => {
    const map = new Map<string, { name: string; issued: number; consumed: number; returned: number }>();
    for (const row of transactions) {
      const name = materialNameById.get(row.materialId) ?? "Unknown material";
      const entry = map.get(row.materialId) ?? { name, issued: 0, consumed: 0, returned: 0 };
      if (row.type === "issue" || row.type === "pbg_issue") entry.issued += row.quantity;
      else if (row.type === "consumption" || row.type === "pbg_consumption") entry.consumed += row.quantity;
      else if (row.type === "return") entry.returned += row.quantity;
      map.set(row.materialId, entry);
    }
    return Array.from(map.entries()).map(([id, value]) => ({ id, ...value }));
  }, [transactions, materialNameById]);

  const summaryColumns: ColumnDef<(typeof perMaterial)[number]>[] = [
    { key: "name", header: "Material" },
    { key: "issued", header: "Issued" },
    { key: "consumed", header: "Consumed" },
    { key: "returned", header: "Returned" },
    { key: "net", header: "Project Usage", render: (row) => row.issued - row.consumed - row.returned },
  ];

  const transactionColumns: ExcelColumn<(typeof transactions)[number]>[] = [
    {
      key: "material",
      label: "Material",
      width: 190,
      sticky: true,
      getValue: (row) => materialNameById.get(row.materialId) ?? "Unknown material",
    },
    {
      key: "type",
      label: "Type",
      width: 150,
      getValue: (row) => TRANSACTION_TYPE_LABELS[row.type] ?? row.type,
    },
    { key: "quantity", label: "Quantity", width: 110, getValue: (row) => row.quantity },
    { key: "site", label: "Site", width: 150, getValue: (row) => row.address || "-" },
    { key: "date", label: "Date", width: 140, getValue: (row) => formatMoneyDate(row.transactionDate) },
    { key: "vendor", label: "Vendor", width: 170, getValue: (row) => row.vendorName || "-" },
    { key: "remarks", label: "Remarks", width: 220, getValue: (row) => row.remarks || "-" },
  ];

  const hasMovements = transactions.length > 0;

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Materials" subtitle="Materials issued, consumed or returned within this project." />

      {!isLoading && !hasMovements ? (
        <SectionCard title="Materials Used on This Project">
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-sm text-muted-foreground">No materials have been issued to this project yet.</p>
            <Link href="/inventory" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Open Inventory
            </Link>
          </div>
        </SectionCard>
      ) : (
        <>
          <SectionCard title="Materials Used on This Project">
            <DataTable
              columns={summaryColumns}
              data={perMaterial}
              variant="striped"
              emptyTitle="No materials have been issued to this project."
            />
          </SectionCard>

          <SectionCard title="Recent Movements">
            <ExcelDataGrid
              columns={transactionColumns}
              rows={transactions}
              isLoading={isLoading}
              emptyTitle="No material movements recorded for this project."
              maxHeightClassName="max-h-[420px]"
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

type TeamFilter = "all" | "supervisors" | "plumbers" | "staff";

const TEAM_EMPTY_MESSAGES: Record<TeamFilter, string> = {
  all: "No active team members found for this project.",
  supervisors: "No supervisors are currently working on this project.",
  plumbers: "No plumbers are currently working on this project.",
  staff: "No staff members are assigned to this project.",
};

// Stable empty-array references so the Team tab's useMemo doesn't see a new
// "empty list" identity on every render while the query is still loading.
const EMPTY_SUPERVISORS: ProjectTeam["supervisors"] = [];
const EMPTY_PLUMBERS: ProjectTeam["plumbers"] = [];
const EMPTY_STAFF: ProjectTeam["staff"] = [];

function ProjectTeamTab({ projectId, active }: { projectId: string; active: boolean }) {
  const { data: team, isLoading } = useProjectTeamQuery(projectId, { enabled: active });
  const [filter, setFilter] = useState<TeamFilter>("all");

  const supervisors = team?.supervisors ?? EMPTY_SUPERVISORS;
  const plumbers = team?.plumbers ?? EMPTY_PLUMBERS;
  const staff = team?.staff ?? EMPTY_STAFF;

  const rows: TeamRow[] = useMemo(() => {
    const supervisorRows: TeamRow[] = supervisors.map((person) => ({
      id: `supervisor-${person.id}`,
      name: person.name,
      role: "Supervisor",
      sites: person.sites.map((site) => site.name).join(", ") || "-",
      workload: `${person.customerCount} Customers`,
      lastActivity: person.lastActivityAt ? formatDate(person.lastActivityAt) : "-",
    }));
    const plumberRows: TeamRow[] = plumbers.map((person) => ({
      id: `plumber-${person.id}`,
      name: person.name,
      role: "Plumber",
      sites: person.sites.map((site) => site.name).join(", ") || "-",
      workload: `${person.customerCount} Customers`,
      lastActivity: person.lastActivityAt ? formatDate(person.lastActivityAt) : "-",
    }));
    const staffRows: TeamRow[] = staff.map((person) => ({
      id: `staff-${person.id}`,
      name: person.name,
      role: toTitleCase(person.designation),
      sites: "-",
      workload: "Assigned to this project",
      lastActivity: "-",
    }));

    if (filter === "supervisors") return supervisorRows;
    if (filter === "plumbers") return plumberRows;
    if (filter === "staff") return staffRows;
    return [...supervisorRows, ...plumberRows, ...staffRows];
  }, [supervisors, plumbers, staff, filter]);

  const columns: ColumnDef<TeamRow>[] = [
    { key: "name", header: "Name", render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
    { key: "role", header: "Role" },
    { key: "sites", header: "Site / Area" },
    { key: "workload", header: "Workload" },
    { key: "lastActivity", header: "Last Activity" },
  ];

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Project Team" subtitle="People actively working on this project" />

      <CompactStatGrid columns={3}>
        <MetricCard label="Supervisors" value={supervisors.length} icon={UserGearIcon} />
        <MetricCard label="Plumbers" value={plumbers.length} icon={UserGearIcon} />
        <MetricCard label="Staff" value={staff.length} icon={UserGearIcon} />
      </CompactStatGrid>

      <SectionCard title="Team Members">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(
            [
              ["all", "All"],
              ["supervisors", "Supervisors"],
              ["plumbers", "Plumbers"],
              ["staff", "Staff"],
            ] as [TeamFilter, string][]
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "default" : "outline"}
              className="h-7 px-2.5 text-xs"
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={rows}
          variant="striped"
          isLoading={isLoading}
          emptyTitle={TEAM_EMPTY_MESSAGES[filter]}
        />
      </SectionCard>
    </div>
  );
}

type TeamRow = {
  id: string;
  name: string;
  role: string;
  sites: string;
  workload: string;
  lastActivity: string;
};

// ---------------------------------------------------------------------------
// Documents (reused as-is from the pre-existing implementation)
// ---------------------------------------------------------------------------

function ProjectDocumentsTab({ projectId }: { projectId: string }) {
  const { data: documents = [], isLoading } = useProjectDocumentsQuery(projectId);
  const createDocumentMutation = useCreateProjectDocument(projectId);
  const deleteDocumentMutation = useDeleteProjectDocument(projectId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectDocument>(emptyDocument);

  const columns: ColumnDef<ProjectDocument>[] = [
    { key: "type", header: "Type" },
    { key: "documentName", header: "Document Name", className: "min-w-48" },
    { key: "number", header: "No. / Reference", className: "min-w-40" },
    { key: "documentDate", header: "Document Date", render: (doc) => formatDate(doc.documentDate) },
    { key: "amount", header: "Amount" },
    { key: "fileName", header: "File", className: "min-w-52" },
    {
      key: "actions",
      header: "Actions",
      className: "w-64",
      render: (doc) => {
        const href = resolveFileUrl(doc.fileUrl);
        return (
          <div className="flex flex-wrap items-center gap-1">
            <ActionButton label="Preview" icon={<EyeIcon size={13} />} href={href} disabled={!href} />
            <ActionButton
              label="Download"
              icon={<DownloadSimpleIcon size={13} />}
              href={href}
              download={doc.fileName || true}
              disabled={!href}
            />
            <ActionButton
              label="Delete"
              icon={<TrashIcon size={13} />}
              onClick={() => deleteDocumentMutation.mutate(doc.id)}
            />
          </div>
        );
      },
    },
  ];

  const saveDocument = async () => {
    if (!draft.type || !draft.number) return;
    await createDocumentMutation.mutateAsync(draft);
    setDialogOpen(false);
    setDraft(emptyDocument);
  };

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Documents" subtitle="Contracts, drawings and other project records" />

      <SectionCard
        title="Document Categories"
        action={
          <Button
            size="sm"
            onClick={() => {
              setDraft(emptyDocument);
              setDialogOpen(true);
            }}
          >
            <FileArrowUpIcon size={14} />
            Upload Document
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {documentCategories.map((category) => (
            <button
              key={category.type}
              className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4 text-center text-sm font-semibold text-foreground hover:border-primary hover:bg-primary/5"
              onClick={() => {
                setDraft({
                  ...emptyDocument,
                  category: category.type,
                  type: category.type,
                  documentName: `${category.label} Document`,
                });
                setDialogOpen(true);
              }}
            >
              <FileArrowUpIcon size={20} className="mx-auto mb-2 text-primary" />
              {category.label}
              <span className="mt-1 block text-xs font-medium text-muted-foreground">
                {documents.filter((doc) => doc.category === category.type || doc.type === category.type).length} uploaded
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Uploaded Documents">
        <DataTable
          columns={columns}
          data={documents}
          variant="striped"
          isLoading={isLoading}
          emptyTitle="No documents uploaded yet."
        />
      </SectionCard>

      <DocumentDialog
        open={dialogOpen}
        draft={draft}
        setDraft={setDraft}
        onOpenChange={setDialogOpen}
        onSave={saveDocument}
        projectId={projectId}
      />
    </div>
  );
}

function DocumentDialog({
  open,
  draft,
  setDraft,
  onOpenChange,
  onSave,
  projectId,
}: {
  open: boolean;
  draft: ProjectDocument;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDocument>>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  projectId: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    setDraft((current) => ({ ...current, fileName: file.name, fileUrl: "" }));
    setUploadError("");
    setIsUploading(true);
    try {
      const uploaded = await uploadFile(file, "projects", projectId);
      setDraft((current) => ({ ...current, fileUrl: uploaded.url }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Add a project document.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Document Type">
            <Select
              value={draft.category}
              onValueChange={(value) => {
                const category = documentCategories.find((item) => item.type === value);
                setDraft((current) => ({
                  ...current,
                  category: category?.type ?? "Other",
                  type: category?.type ?? "Other",
                  documentName: current.documentName || `${category?.label ?? "Other"} Document`,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((category) => (
                  <SelectItem key={category.type} value={category.type}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <CompactInput
            label="Document Name"
            value={draft.documentName}
            onChange={(value) => setDraft((current) => ({ ...current, documentName: value }))}
          />
          <CompactInput
            label="No. / Reference"
            value={draft.number}
            onChange={(value) => setDraft((current) => ({ ...current, number: value }))}
          />
          <CompactInput
            label="Amount"
            value={draft.amount}
            onChange={(value) => setDraft((current) => ({ ...current, amount: value }))}
          />
          <CompactInput
            label="Document Date"
            type="date"
            value={draft.documentDate}
            onChange={(value) => setDraft((current) => ({ ...current, documentDate: value, issueDate: value }))}
          />
          <CompactInput
            label="Expiry Date"
            type="date"
            value={draft.expiryDate}
            onChange={(value) => setDraft((current) => ({ ...current, expiryDate: value }))}
          />
          <FormField label="File">
            <Input type="file" onChange={(event) => void handleFileSelect(event.target.files?.[0])} />
            {isUploading ? (
              <p className="mt-1 text-xs text-primary">Uploading {draft.fileName}...</p>
            ) : draft.fileUrl ? (
              <p className="mt-1 text-xs text-muted-foreground">Ready to save: {draft.fileName}</p>
            ) : null}
            {uploadError ? <p className="mt-1 text-xs text-destructive">{uploadError}</p> : null}
          </FormField>
          <FormField label="Remarks">
            <Textarea
              value={draft.remarks}
              onChange={(event) => setDraft((current) => ({ ...current, remarks: event.target.value }))}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isUploading}>
            Save Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

function ProjectActivityTab({ projectId }: { projectId: string }) {
  const { data: logs = [], isLoading } = useAuditLogsQuery({ projectId });

  const columns: ColumnDef<(typeof logs)[number]>[] = [
    { key: "user", header: "User", render: (row) => <b>{row.user}</b> },
    { key: "action", header: "Action" },
    { key: "module", header: "Module" },
    { key: "description", header: "Description" },
    { key: "dateTime", header: "Date & Time", render: (row) => formatDateTime(row.dateTime) },
  ];

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Activity" subtitle="Recent changes recorded for this project" />

      <SectionCard title="Recent Activity">
        <DataTable
          columns={columns}
          data={logs}
          variant="striped"
          isLoading={isLoading}
          emptyTitle="No activity recorded for this project yet."
        />
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function InfoGrid({ items }: { items: (string | undefined)[][] }) {
  return <KeyValueGrid items={items.map(([label, value]) => ({ label: label ?? "", value }))} columns={2} />;
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="px-1 py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

function CompactInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  if (type === "date") {
    return (
      <FormField label={label}>
        <DatePicker value={value} onChange={onChange} />
      </FormField>
    );
  }

  return (
    <FormField label={label}>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </FormField>
  );
}

function toTitleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function formatDate(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}

const emptyDocument: ProjectDocument = {
  id: "new",
  type: "Other",
  number: "",
  documentName: "",
  documentDate: "",
  contractDate: "",
  issueDate: "",
  expiryDate: "",
  amount: "",
  category: "Other",
  fileName: "document.pdf",
  remarks: "",
  uploadedOn: format(new Date(), "yyyy-MM-dd"),
  uploadedBy: "Demo Admin",
};
