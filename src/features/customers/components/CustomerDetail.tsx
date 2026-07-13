"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  ClockCounterClockwiseIcon,
  DownloadSimpleIcon,
  EyeIcon,
  FileTextIcon,
  LinkIcon,
  NotePencilIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  customerActivity,
  customerDocuments,
  customerWorkStages,
} from "../services/customers.service";
import type {
  Customer,
  CustomerActivity,
  CustomerDocument,
  CustomerWorkStageRecord,
} from "../types/customer.types";
import { CustomerBreadcrumb } from "./CustomerBreadcrumb";
import { CustomerInfoLine } from "./CustomerInfoLine";

const relatedModuleLinks = [
  { label: "Surveys", href: "/surveys", count: 1 },
  { label: "Work Progress", href: "/work-progress", count: 6 },
  { label: "GC Uploads", href: "/gc-uploads", count: 1 },
  { label: "Pre-Commissioning", href: "/pre-commissioning", count: 1 },
  { label: "Testing / Pressure", href: "/pressure-observation", count: 1 },
  { label: "JMR", href: "/jmr", count: 1 },
  { label: "Billing", href: "/billing", count: 3 },
];

export function CustomerDetail({ customer }: { customer: Customer }) {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const applyLinkedTab = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedTab = params.get("tab") ?? window.location.hash.replace("#", "");
      if (customerTabValues.includes(requestedTab)) {
        setActiveTab(requestedTab);
      }
    };

    applyLinkedTab();
    window.addEventListener("hashchange", applyLinkedTab);
    return () => window.removeEventListener("hashchange", applyLinkedTab);
  }, []);

  return (
    <div className="space-y-4">
      <CustomerBreadcrumb
        items={[
          { label: "Customers", href: "/customers" },
          { label: customer.name },
        ]}
      />

      <DetailHeader
        title={customer.name}
        badges={
          <>
            <StatusBadge status={customer.currentStage} />
            <StatusBadge status={customer.status} />
          </>
        }
        meta={
          <>
            <CustomerInfoLine label="BP/TR Number" value={customer.bpTrNumber} />
            <CustomerInfoLine label="Mobile" value={customer.mobileNumber} />
            <CustomerInfoLine label="Site" value={customer.siteArea} />
          </>
        }
        actions={
          <Link
            href={`/customers/${customer.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            <NotePencilIcon size={15} />
            Edit
          </Link>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value ?? "overview")}
        className="flex flex-col gap-3"
      >
        <div className="border-b border-border/70">
          <TabsList
            variant="line"
            className="flex w-fit max-w-full flex-wrap justify-start gap-4 p-0"
          >
            <CustomerTab index={1} value="overview">Overview</CustomerTab>
            <CustomerTab index={2} value="connection">Connection</CustomerTab>
            <CustomerTab index={3} value="work-progress">Work Progress</CustomerTab>
            <CustomerTab index={4} value="documents">Reports & Documents</CustomerTab>
            <CustomerTab index={5} value="activity">Activity</CustomerTab>
          </TabsList>
        </div>

        <div className="min-w-0">
          <TabsContent value="overview">
            <CustomerOverview customer={customer} />
          </TabsContent>
          <TabsContent value="connection">
            <CustomerConnection customer={customer} />
          </TabsContent>
          <TabsContent value="work-progress">
            <CustomerWorkProgress customer={customer} />
          </TabsContent>
          <TabsContent value="documents">
            <CustomerReports customer={customer} />
          </TabsContent>
          <TabsContent value="activity" id="activity">
            <CustomerActivityTimeline customerId={customer.id} items={customerActivity} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

const customerTabValues = [
  "overview",
  "connection",
  "work-progress",
  "documents",
  "activity",
];

function CustomerTab({
  index,
  value,
  children,
}: {
  index: number;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <TabsTrigger
      className="min-h-8 flex-none cursor-pointer justify-start gap-1.5 rounded-none px-0 py-1.5 font-medium text-muted-foreground hover:text-foreground"
      value={value}
    >
      <span className="text-xs font-medium tabular-nums text-muted-foreground">{index}.</span>
      <span className="min-w-0 whitespace-normal text-left leading-snug">{children}</span>
    </TabsTrigger>
  );
}

function CustomerOverview({ customer }: { customer: Customer }) {
  const contactDetails: [string, string][] = [
    ["Mobile Number", customer.mobileNumber],
    ["BP / TR Number", customer.bpTrNumber],
    ["Connection Type", customer.connectionType],
    ["Current Stage", customer.currentStage],
  ];

  const assignment: [string, string][] = [
    ["Project", customer.projectName],
    ["Site / Area", customer.siteArea],
    ["Supervisor", customer.supervisor],
    ["Plumber / Group", customer.plumberGroup],
    ["Field Executive", customer.fieldExecutive],
  ];

  const dates: [string, string][] = [
    ["Created", formatDate(customer.createdDate)],
    ["Survey", formatDate(customer.surveyDate)],
    ["GI / Plumbing Installation", formatDate(customer.installationDate)],
    ["Commissioning", formatDate(customer.commissioningDate)],
    ["Conversion", formatDate(customer.conversionDate)],
  ];
  const stageDates: Record<string, string> = {
    Survey: customer.surveyDate,
    "Plumbing/GI": customer.installationDate,
    GC: customer.testingDate,
    Commissioning: customer.commissioningDate,
    Conversion: customer.conversionDate,
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-2">
        <OverviewPanel title="Contact & Address">
          <InfoGrid items={contactDetails} compact />
          <div className="mt-3 rounded-md bg-muted/25 px-3 py-2.5">
            <CustomerInfoLine label="Address" value={customer.fullAddress} />
            <CustomerInfoLine
              label="GPS"
              value={`${customer.latitude}, ${customer.longitude}`}
              className="mt-0.5"
            />
          </div>
        </OverviewPanel>

        <OverviewPanel title="Project & Assignment">
          <InfoGrid items={assignment} compact />
        </OverviewPanel>
      </div>

      <div className="grid gap-3 xl:grid-cols-[0.9fr_1.3fr]">
        <OverviewPanel title="Important Dates">
          <InfoGrid items={dates} compact />
        </OverviewPanel>

        <OverviewPanel title="Stage Tracker">
          <ConnectedStageTracker
            currentStage={customer.currentStage}
            stageDates={stageDates}
          />
        </OverviewPanel>
      </div>

      <OverviewPanel title="Related Global Modules">
        <div className="flex flex-wrap items-center gap-1.5">
          {relatedModuleLinks.map((link) => (
            <Link
              key={link.href}
              href={`${link.href}?customerId=${customer.id}`}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-accent/40"
            >
              <LinkIcon size={14} />
              {link.label}
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {link.count}
              </span>
            </Link>
          ))}
          <Link
            href={`/customers/${customer.id}/gi-details`}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-accent/40"
          >
            <LinkIcon size={14} />
            GI Details
          </Link>
        </div>
      </OverviewPanel>

      <OverviewPanel title="Billing Status">
        <div className="grid gap-2 sm:grid-cols-3">
          <BillingStatus label="GI Bill Done" done={customer.giBillDone} />
          <BillingStatus label="GC Bill Done" done={customer.gcBillDone} />
          <BillingStatus
            label="Conversion Bill Done"
            done={customer.conversionBillDone}
          />
        </div>
      </OverviewPanel>
    </div>
  );
}

function OverviewPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card">
      <div className="flex items-center justify-between border-b border-border/55 px-3 py-2">
        <h2 className="text-sm font-semibold text-foreground">
          {title}
        </h2>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function CustomerConnection({ customer }: { customer: Customer }) {
  const customerConnection: [string, string][] = [
    ["Connection Type", customer.connectionType],
    ["House Type", customer.houseType],
    ["Scheme", customer.scheme],
    ["Connection Payment Status", customer.paymentStatus],
    ["Payment Mode", customer.paymentMode],
    ["Initial Amount", customer.initialAmount ? `Rs. ${customer.initialAmount}` : "-"],
  ];

  const meterRegulator: [string, string][] = [
    ["Meter Number", customer.meterNumber || "-"],
    ["Meter Type", customer.meterType || "-"],
    ["Regulator Number", customer.regulatorNumber || "-"],
    ["Regulator Pressure", customer.regulatorPressure || "-"],
    ["Meter Reading", customer.meterReading || "-"],
  ];

  const importantDates: [string, string][] = [
    ["GI / Plumbing Installation", formatDate(customer.installationDate)],
    ["Testing / Purging Date", formatDate(customer.testingDate)],
    ["Commissioning Date", formatDate(customer.commissioningDate)],
    ["Conversion Date", formatDate(customer.conversionDate)],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Customer Connection">
          <InfoGrid items={customerConnection} />
        </SectionCard>
        <SectionCard title="Meter & Regulator">
          <InfoGrid items={meterRegulator} />
        </SectionCard>
      </div>
      <SectionCard title="Important Dates">
        <InfoGrid items={importantDates} columns="xl:grid-cols-4" />
      </SectionCard>
      <SectionCard title="Non-conversion Remarks">
        <p className="text-sm text-muted-foreground">
          {customer.nonConversionRemarks || "No remarks added."}
        </p>
      </SectionCard>
    </div>
  );
}

function CustomerWorkProgress({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Work Progress">
        <div className="divide-y divide-border/60 rounded-lg border border-border">
          {customerWorkStages.map((stage) => (
            <StageRow key={stage.id} stage={stage} />
          ))}
        </div>
        <div className="mt-4 border-t border-border/60 pt-3">
          <p className="text-xs font-medium text-foreground">Latest Update</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
            <CustomerInfoLine label="Stage" value={customer.currentStage} />
            <CustomerInfoLine label="Updated By" value="Ramesh Kumar" />
            <CustomerInfoLine
              label="Date"
              value={formatDate(customer.commissioningDate || customer.installationDate)}
            />
            <CustomerInfoLine label="Record" value={customer.bpTrNumber} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Related Photos">
        <div className="grid gap-2 sm:grid-cols-3">
          {["Survey front elevation", "Meter location", "GC completion"].map((photo) => (
            <Link
              key={photo}
              href={`/documents?customerId=${customer.id}&type=photo`}
              className="rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
            >
              <FileTextIcon size={18} className="mb-2 text-primary" />
              <p className="text-xs font-semibold text-foreground">{photo}</p>
              <p className="text-xs text-muted-foreground">Linked media record</p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function StageRow({ stage }: { stage: CustomerWorkStageRecord }) {
  return (
    <div className="grid gap-2 px-3 py-2.5 transition-colors hover:bg-accent/30 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
      <div>
        <p className="text-sm font-semibold text-foreground">{stage.stage}</p>
        <Link
          href={stage.href}
          className="text-xs font-medium text-muted-foreground hover:text-primary"
        >
          {stage.relatedRecord}
        </Link>
      </div>
      <StatusBadge status={stage.status} />
      <CustomerInfoLine label="Date" value={formatDate(stage.date)} />
      <CustomerInfoLine label="Updated By" value={stage.updatedBy} />
    </div>
  );
}

function ConnectedStageTracker({
  currentStage,
  stageDates,
}: {
  currentStage: string;
  stageDates: Record<string, string>;
}) {
  const stages = ["Survey", "Plumbing/GI", "GC", "Commissioning", "Conversion"];
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) =>
      currentStage === "Plumbing / GI" ? stage === "Plumbing/GI" : stage === currentStage,
    ),
  );

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2">
      {stages.map((stage, index) => {
        const completed = index < activeIndex;
        const current = index === activeIndex;
        const status = completed ? "Completed" : current ? "Current" : "Pending";
        return (
          <div
            key={stage}
            className={`relative rounded-lg border px-2.5 py-2 ${
              current
                  ? "border-primary/35 bg-primary/10"
                : completed
                  ? "border-primary/15 bg-muted/20"
                  : "border-border bg-background/70"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold ${
                  completed || current
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>
              <p
                className={`min-w-0 text-xs font-semibold leading-snug ${
                  completed || current ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {stage}
              </p>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
              {status} - {formatDate(stageDates[stage])}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function BillingStatus({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <StatusBadge status={done ? "Completed" : "Pending"} />
    </div>
  );
}

function CustomerReports({ customer }: { customer: Customer }) {
  const columns: ColumnDef<CustomerDocument>[] = [
    { key: "title", header: "Document" },
    { key: "category", header: "Category" },
    { key: "fileName", header: "File Name" },
    { key: "uploadedOn", header: "Uploaded On", render: (row) => formatDate(row.uploadedOn) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "w-36",
      render: (row) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="Preview">
            <Link
              href={`/documents?customerId=${customer.id}&documentId=${row.id}`}
              aria-label="Preview document"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
          {row.status === "Approved" ? (
            <ActionTooltip label="Download">
              <Link
                href={`/documents?customerId=${customer.id}&documentId=${row.id}&action=download`}
                aria-label="Download document"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              >
                <DownloadSimpleIcon size={15} />
              </Link>
            </ActionTooltip>
          ) : null}
          {row.status === "In Review" || row.status === "Pending" ? (
            <ActionTooltip label="Approval History">
              <Link
                href={`/approvals?customerId=${customer.id}&documentId=${row.id}`}
                aria-label="View approval history"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              >
                <ClockCounterClockwiseIcon size={15} />
              </Link>
            </ActionTooltip>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Reports & Documents">
        <DataTable data={customerDocuments} columns={columns} variant="striped" />
      </SectionCard>

      <SectionCard title="Open Related Modules">
        <div className="flex flex-wrap gap-2">
          {[
            ["Survey photos", "/surveys"],
            ["GC image / PDF", "/gc-uploads"],
            ["Pre-commissioning report", "/pre-commissioning"],
            ["Pressure observation report", "/pressure-observation"],
            ["JMR upload", "/jmr"],
            ["FIM / Conjunction / LMC uploads", "/documents"],
            ["Other documents", "/documents"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={`${href}?customerId=${customer.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <LinkIcon size={14} />
              {label}
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function CustomerActivityTimeline({
  customerId,
  items,
}: {
  customerId: string;
  items: CustomerActivity[];
}) {
  return (
    <SectionCard title="Activity">
      <div className="relative space-y-3 pl-6 before:absolute before:bottom-4 before:left-2 before:top-4 before:w-px before:bg-border">
        {items.map((item) => (
          <div key={item.id} className="relative rounded-lg bg-muted/30 p-3">
            <span className="absolute -left-[1.35rem] top-3 h-3 w-3 rounded-full border-2 border-card bg-primary" />
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <CustomerInfoLine
                  label="Details"
                  value={item.description}
                  className="mt-0.5"
                  valueClassName="font-medium"
                />
              </div>
              <CustomerInfoLine label="Date" value={formatDateTime(item.dateTime)} />
            </div>
            <div className="mt-1">
              <CustomerInfoLine
                label="Actor"
                value={item.actor}
                className="inline"
              />
              <span className="mx-2 text-muted-foreground">-</span>
              <Link
                href={getRelatedRecordHref(item, customerId)}
                className="text-xs font-semibold text-foreground hover:text-primary"
              >
                {item.relatedRecord}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function InfoGrid({
  items,
  columns = "xl:grid-cols-2",
  compact = false,
}: {
  items: [string, string][];
  columns?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`grid ${compact ? "gap-x-5 gap-y-1" : "gap-x-8 gap-y-1"} md:grid-cols-2 ${columns}`}
    >
      {items.map(([label, value]) => (
        <CustomerInfoLine key={label} label={label} value={value} />
      ))}
    </div>
  );
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

function getRelatedRecordHref(item: CustomerActivity, customerId: string) {
  const record = item.relatedRecord.toLowerCase();
  if (record.includes("survey")) return `/surveys?customerId=${customerId}`;
  if (record.includes("gc")) return `/gc-uploads?customerId=${customerId}`;
  if (record.includes("pressure")) return `/pressure-observation?customerId=${customerId}`;
  if (record.includes("mtr")) return `/customers/${customerId}?tab=connection`;
  return `/customers/${customerId}`;
}
