"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  EyeIcon,
  FilePdfIcon,
  FileTextIcon,
  ImageIcon,
  NotePencilIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageShell } from "@/components/shared/PageShell";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePanel } from "@/components/shared/TablePanel";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  getJmrById,
  jmrAttachments,
  jmrMeasurements,
  jmrProjectOptions,
  jmrRecords,
  jmrRevisions,
  jmrStatuses,
} from "../services/jmr.service";
import type { JmrAttachment, JmrRecord } from "../types/jmr.types";

const initialFilters = {
  search: "",
  project: "all",
  status: "all",
};

export function JmrList() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return jmrRecords.filter((record) => {
      const matchesSearch =
        !search ||
        record.reportNo.toLowerCase().includes(search) ||
        record.customerName.toLowerCase().includes(search) ||
        record.bpTrNumber.toLowerCase().includes(search);
      const matchesProject = filters.project === "all" || record.projectName === filters.project;
      const matchesStatus = filters.status === "all" || record.status === filters.status;
      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [filters]);

  const pagination = usePagination({ items: filteredRecords, pageSize: 8 });

  const columns: ColumnDef<JmrRecord>[] = [
    {
      key: "report",
      header: "Report",
      render: (record) => (
        <div>
          <Link href={`/jmr/${record.id}`} className="font-semibold text-foreground hover:text-primary">
            {record.reportNo}
          </Link>
          <p className="text-xs font-medium text-muted-foreground">{record.reportType}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Work Package",
      render: (record) => (
        <div>
          <p className="font-semibold text-foreground">{record.workPackage}</p>
          <p className="text-xs font-medium text-muted-foreground">{record.bpTrNumber}</p>
        </div>
      ),
    },
    {
      key: "project",
      header: "Quantity",
      render: (record) => (
        <div>
          <p className="font-semibold text-foreground">Executed: {record.executedQuantity}</p>
          <p className="text-xs font-medium text-muted-foreground">Approved: {record.approvedQuantity}</p>
        </div>
      ),
    },
    { key: "submittedBy", header: "Submitted By" },
    {
      key: "submittedDate",
      header: "Submitted Date",
      render: (record) => formatDateTime(record.submittedDate),
    },
    {
      key: "status",
      header: "Status",
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32",
      render: (record) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="View JMR">
            <Link href={`/jmr/${record.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Upload / edit JMR">
            <Link href={`/jmr/${record.id}/upload`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <NotePencilIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Meter / PDF preview">
            <Link href={`/jmr/${record.id}/meter-preview`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <FilePdfIcon size={15} />
            </Link>
          </ActionTooltip>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="JMR & Field Reports"
      subtitle="Upload JMRs, field reports, FIM, conjunction and LMC documents."
      actions={
        <Link href="/jmr/jmr-001/upload" className={buttonVariants({ variant: "default" })}>
          <UploadSimpleIcon size={15} />
          Upload JMR
        </Link>
      }
    >
      <TablePanel
        title="JMR Register"
        subtitle="Measurement reports, attachments and approval status."
        toolbar={
          <FilterSheetButton
            searchKey="search"
            searchPlaceholder="Search report, customer or BP/TR..."
            values={filters}
            filters={[
              { key: "project", placeholder: "All Projects", options: jmrProjectOptions },
              { key: "status", placeholder: "All Statuses", options: jmrStatuses.map((status) => ({ label: status, value: status })) },
            ]}
            onChange={(key, value) => {
              setFilters((current) => ({ ...current, [key]: value }));
              pagination.setPage(1);
            }}
            onReset={() => {
              setFilters(initialFilters);
              pagination.setPage(1);
            }}
          />
        }
        pagination={
          <Pagination
            compact
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={pagination.totalItems}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            onPageChange={pagination.setPage}
          />
        }
      >
        <DataTable
          data={pagination.paginatedItems}
          columns={columns}
          serialNumberStart={pagination.startItem}
          emptyTitle="No JMR records found"
          stickyHeader
          stickyLastColumn
          containerClassName="rounded-none border-0"
        />
      </TablePanel>
    </PageShell>
  );
}

export function JmrDetail({ id }: { id: string }) {
  const record = getJmrById(id);
  const measurementColumns: ColumnDef<(typeof jmrMeasurements)[number]>[] = [
    { key: "item", header: "Measurement Item" },
    { key: "unit", header: "Unit" },
    { key: "executed", header: "Executed Qty" },
    { key: "approved", header: "Approved Qty" },
    { key: "remarks", header: "Remarks" },
  ];

  return (
    <div className="space-y-4">
      <ModuleBreadcrumb items={[["JMR & Field Reports", "/jmr"], [record.reportNo]]} />
      <header className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{record.reportNo}</h1>
              <StatusBadge status={record.status} />
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">JMR documents, meter proof and related upload status.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/jmr/${record.id}/meter-preview`} className={buttonVariants({ variant: "outline" })}>
              <EyeIcon size={15} />
              Preview
            </Link>
            <Link href={`/jmr/${record.id}/upload`} className={buttonVariants({ variant: "default" })}>
              <UploadSimpleIcon size={15} />
              Upload / Edit
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="JMR Reference" />
            <KeyValueGrid
              rows={[
                ["JMR No.", record.reportNo],
                ["Work Package", record.workPackage],
                ["Executed Qty", record.executedQuantity],
                ["Approved Qty", record.approvedQuantity],
                ["Status", <StatusBadge key="status" status={record.status} />],
                ["Submitted", formatDateTime(record.submittedDate)],
              ]}
            />
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Measurement Rows" description="Executed quantity and approved quantity for this JMR." />
            <div className="mt-3">
              <DataTable data={jmrMeasurements} columns={measurementColumns} emptyTitle="No measurements added" />
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Meter Photo / PDF Preview" description="Compact preview cards for field validation." />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <PreviewCard icon={<ImageIcon size={24} />} title="Meter Photo" file={record.meterPhoto} />
              <PreviewCard icon={<FilePdfIcon size={24} />} title="JMR PDF" file={record.pdfName} />
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Uploaded Documents" />
            <div className="mt-3 grid gap-2">
              {jmrAttachments.map((item) => <AttachmentRow key={item.id} item={item} />)}
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Related Uploads" />
            <div className="mt-3 space-y-2">
              <UploadLink href={`/jmr/${record.id}/fim`} label="FIM Upload" status={record.fimStatus} />
              <UploadLink href={`/jmr/${record.id}/conjunction`} label="Conjunction Upload" status={record.conjunctionStatus} />
              <UploadLink href={`/jmr/${record.id}/lmc`} label="LMC Upload" status={record.lmcStatus} />
            </div>
          </section>
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Remarks" />
            <p className="mt-3 text-sm font-medium text-foreground">{record.remarks}</p>
          </section>
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Revision History" />
            <div className="mt-3 space-y-2">
              {jmrRevisions.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/60 bg-background px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{item.revision}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{item.actor} - {formatDateTime(item.dateTime)}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{item.remarks}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

export function JmrUploadPage({ id, uploadType = "JMR" }: { id: string; uploadType?: "JMR" | "FIM" | "Conjunction" | "LMC" }) {
  const record = getJmrById(id);
  const title = uploadType === "JMR" ? "Upload / Edit JMR" : `${uploadType} Upload`;
  return (
    <div className="space-y-4">
      <ModuleBreadcrumb items={[["JMR & Field Reports", "/jmr"], [record.reportNo, `/jmr/${record.id}`], [title]]} />
      <header className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">Upload document, photo and comments for reviewer validation.</p>
      </header>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form className="rounded-xl border border-border/60 bg-card p-4">
          <SectionHeading title="Upload Details" />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Field label="Report Number" defaultValue={record.reportNo} />
            <Field label="Document Type" defaultValue={uploadType} />
            <Field label="Upload File" type="file" />
            <Field label="Meter Photo" type="file" />
          </div>
          <label className="mt-3 grid gap-1.5">
            <span className="text-xs font-medium text-foreground">Remarks</span>
            <Textarea defaultValue={record.remarks} className="min-h-28" />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <Link href={`/jmr/${record.id}`} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
            <Button type="button">Save Upload</Button>
          </div>
        </form>

        <aside className="rounded-xl border border-border/60 bg-card p-4">
          <SectionHeading title="JMR Reference" />
          <div className="mt-3 space-y-1.5">
            <InfoLine label="JMR No." value={record.reportNo} />
            <InfoLine label="Package" value={record.workPackage} />
            <InfoLine label="Executed" value={record.executedQuantity} />
            <InfoLine label="Approved" value={record.approvedQuantity} />
          </div>
        </aside>
      </section>
    </div>
  );
}

export function JmrPreviewPage({ id }: { id: string }) {
  const record = getJmrById(id);
  return (
    <div className="space-y-4">
      <ModuleBreadcrumb items={[["JMR & Field Reports", "/jmr"], [record.reportNo, `/jmr/${record.id}`], ["Meter / PDF Preview"]]} />
      <header className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Meter Photo / PDF Preview</h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">Mock preview of submitted meter photo and JMR PDF.</p>
      </header>
      <section className="grid gap-4 lg:grid-cols-2">
        <PreviewPanel title="Meter Photo" file={record.meterPhoto} icon={<ImageIcon size={28} />} />
        <PreviewPanel title="JMR PDF" file={record.pdfName} icon={<FilePdfIcon size={28} />} />
      </section>
    </div>
  );
}

function PreviewPanel({ title, file, icon }: { title: string; file: string; icon: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4">
      <SectionHeading title={title} />
      <div className="mt-3 grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-muted/25 text-center">
        <div>
          <div className="mx-auto grid size-14 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
          <p className="mt-3 text-sm font-semibold text-foreground">{file}</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Preview placeholder for uploaded file.</p>
        </div>
      </div>
    </section>
  );
}

function AttachmentRow({ item }: { item: JmrAttachment }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2">
      <FileTextIcon size={16} className="text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
        <p className="truncate text-xs font-medium text-muted-foreground">{item.fileName} - {formatDateTime(item.uploadedOn)}</p>
      </div>
      <StatusBadge status={item.status} />
    </div>
  );
}

function PreviewCard({ icon, title, file }: { icon: React.ReactNode; title: string; file: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="truncate text-xs font-medium text-muted-foreground">{file}</p>
        </div>
      </div>
    </div>
  );
}

function UploadLink({ href, label, status }: { href: string; label: string; status: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 hover:bg-muted/35">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <StatusBadge status={status} />
    </Link>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <Input type={type} defaultValue={type === "file" ? undefined : defaultValue} className="h-9" />
    </label>
  );
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-0.5 text-xs font-medium text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function KeyValueGrid({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="mt-3 grid gap-x-6 gap-y-1.5 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, value]) => <InfoLine key={label} label={label} value={value} />)}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      <span className="min-w-0 text-sm font-semibold text-foreground">{value || "-"}</span>
    </div>
  );
}

function ModuleBreadcrumb({ items }: { items: ([string] | [string, string])[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {items.map(([label, href], index) => (
        <span key={`${label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 ? <span className="text-muted-foreground/70">/</span> : null}
          {href ? <Link href={href} className="hover:text-primary">{label}</Link> : <span className="font-semibold text-foreground">{label}</span>}
        </span>
      ))}
    </nav>
  );
}

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
