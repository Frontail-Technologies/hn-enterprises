"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, EyeIcon, SaveIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getReportTemplateById, resolveReportTemplateData } from "../services/report-templates.service";
import type { ReportTemplateId } from "../types/report-template.types";

type MappingRow = {
  id: string;
  section: string;
  label: string;
  source: string;
  sample: string;
};

export function ReportTemplateEditPage({ templateId }: { templateId: ReportTemplateId }) {
  const template = getReportTemplateById(templateId);
  const data = template
    ? resolveReportTemplateData(template.id, template.defaultCustomerId, template.defaultRecordId)
    : null;

  const initialRows = useMemo(() => (data ? buildMappingRows(data) : []), [data]);
  const [title, setTitle] = useState(template?.title ?? "");
  const [category, setCategory] = useState(template?.category ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [rows, setRows] = useState<MappingRow[]>(initialRows);
  const [savedAt, setSavedAt] = useState("");

  if (!template || !data) {
    return (
      <div className="rounded-sm border border-border bg-card p-6">
        <p className="text-sm font-semibold text-foreground">Template not found</p>
        <Link href="/reports/templates" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
          Back to templates
        </Link>
      </div>
    );
  }

  function updateRow(id: string, key: "label" | "source", value: string) {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  }

  function handleSave() {
    setSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/reports/templates"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2 mb-1" })}
          >
            <ArrowLeftIcon size={15} />
            Templates
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Edit Template</h1>
          <p className="text-sm text-muted-foreground">
            Configure template labels and mock data mappings before final PDF generation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/reports/templates/${template.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <EyeIcon size={15} />
            Preview
          </Link>
          <Button onClick={handleSave}>
            <SaveIcon size={15} />
            Save Template
          </Button>
        </div>
      </div>

      {savedAt ? (
        <div className="rounded-sm border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
          Template changes saved locally at {savedAt}.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="space-y-4 rounded-sm border border-border bg-card p-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Template Settings</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              These settings are frontend-only until backend template storage is added.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-title">Template Title</Label>
            <Input id="template-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-category">Category</Label>
            <Input
              id="template-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </div>

          <div className="rounded-sm border border-border bg-muted/40 p-3">
            <p className="text-xs font-semibold text-foreground">Default data source</p>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p>Customer: {template.defaultCustomerId}</p>
              <p>Record: {template.defaultRecordId ?? "-"}</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Field Mapping</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Edit paper labels or mapping notes. Sample values show what the template currently resolves.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-sm">
              <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Section</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Paper Label</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Data Mapping</th>
                  <th className="border-b border-border px-3 py-2 text-left">Sample Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="w-[160px] border-b border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                      {row.section}
                    </td>
                    <td className="w-[240px] border-b border-r border-border px-3 py-2">
                      <Input
                        value={row.label}
                        onChange={(event) => updateRow(row.id, "label", event.target.value)}
                        className="h-8"
                      />
                    </td>
                    <td className="w-[280px] border-b border-r border-border px-3 py-2">
                      <Input
                        value={row.source}
                        onChange={(event) => updateRow(row.id, "source", event.target.value)}
                        className="h-8"
                      />
                    </td>
                    <td className="border-b border-border px-3 py-2 text-sm text-foreground">
                      {row.sample || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function buildMappingRows(data: NonNullable<ReturnType<typeof resolveReportTemplateData>>): MappingRow[] {
  const rows: Array<Omit<MappingRow, "id">> = [
    { section: "Header", label: "Client", source: "client", sample: data.client },
    { section: "Header", label: "Consultant", source: "consultant", sample: data.consultant },
    { section: "Header", label: "Contractor", source: "contractor", sample: data.contractor },
    { section: "Customer", label: "Customer Name", source: "customer.customerConnection.customerName", sample: data.customerName },
    { section: "Customer", label: "BP/TR Number", source: "customer.customerConnection.trBpNo", sample: data.bpNo },
    { section: "Customer", label: "Phone No", source: "customer.customerConnection.mobileNo", sample: data.phoneNo },
    { section: "Customer", label: "Customer Address", source: "customer.customerConnection.fullAddress", sample: data.customerAddress },
    { section: "Meter", label: "Meter No", source: "customer.commissioningConversion.meterNo", sample: data.meterNo },
    { section: "Meter", label: "Meter Type", source: "customer.commissioningConversion.meterType", sample: data.meterType },
    { section: "Regulator", label: "Regulator No", source: "customer.commissioningConversion.regulatorNo", sample: data.regulatorNo },
    { section: "Regulator", label: "Regulator Pressure", source: "customer.commissioningConversion.regulatorPressure", sample: data.regulatorPressure },
    { section: "Testing", label: "Riser Testing Pressure", source: "pressure.pressureRange", sample: data.riserTestingPressure },
    { section: "Testing", label: "Testing Time", source: "pressure.duration", sample: data.riserTestingTime },
    { section: "JMR", label: "Meter Reading", source: "customer.commissioningConversion.meterReading", sample: data.meterReading },
    { section: "Common", label: "Remarks", source: "record.remarks", sample: data.remarks },
  ];

  return rows.map((row, index) => ({ id: `mapping-${index + 1}`, ...row }));
}
