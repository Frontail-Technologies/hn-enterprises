"use client";

import { useRef, useState } from "react";
import { createElement } from "react";
import { toast } from "sonner";
import { FilePdfIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { projectsApi } from "@/features/projects/services/projects.service";
import type { Project } from "@/features/projects/types/project.types";
import { useEffectiveReportTemplates } from "@/features/report-templates/hooks/useReportTemplateOverrides";
import { resolveReportTemplateDataFromCustomer } from "@/features/report-templates/services/report-templates.service";
import { customersApi } from "../../api/customers.api";
import type { Customer } from "../../types/customer.types";

/** A ZIP of this many PDFs or more takes a while; say so before starting. */
const LARGE_JOB = 300;
const FETCH_CHUNK = 200;

const safeName = (value: string) => value.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "customer";

type OutputMode = "combined" | "separate";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Bulk PDFs for the selected customers and chosen forms, either as one PDF
 * per form with every customer's copy (ready to print) or as a ZIP with a
 * file per customer (one folder per form). Uses each customer's project
 * details and the saved template labels, exactly like the single preview.
 */
export function BulkPdfDialog({
  open,
  onOpenChange,
  customerIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerIds: string[];
}) {
  const { templates } = useEffectiveReportTemplates();
  const [chosen, setChosen] = useState<string[]>([]);
  const [mode, setMode] = useState<OutputMode>("combined");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const cancelled = useRef(false);

  const selectedTemplates = templates.filter((template) => chosen.includes(template.id));
  const totalPdfs = selectedTemplates.length * customerIds.length;
  // Progress counts customers' copies in both modes.
  const running = progress !== null;

  function toggle(id: string) {
    setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function generate() {
    cancelled.current = false;
    setProgress({ done: 0, total: totalPdfs });
    try {
      const [{ pdf }, { ReportPdfDocument, ReportPdfBundle }, { default: JSZip }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/features/report-templates/components/pdf/ReportPdfDocument"),
        import("jszip"),
      ]);

      const customers: Customer[] = [];
      for (let index = 0; index < customerIds.length; index += FETCH_CHUNK) {
        customers.push(...(await customersApi.getByIds(customerIds.slice(index, index + FETCH_CHUNK))));
      }
      const projects = new Map<string, Project | undefined>();
      for (const projectId of new Set(customers.map((customer) => customer.projectId).filter(Boolean))) {
        projects.set(projectId, await projectsApi.get(projectId).catch(() => undefined));
      }

      const dataFor = (template: (typeof selectedTemplates)[number], customer: Customer) => ({
        ...resolveReportTemplateDataFromCustomer(template.id, customer, projects.get(customer.projectId)),
        fieldLabels: template.fieldLabels,
      });
      const today = new Date().toISOString().slice(0, 10);

      if (mode === "combined") {
        // One PDF per form, every customer's copy one after another.
        const files: { name: string; blob: Blob }[] = [];
        let done = 0;
        for (const template of selectedTemplates) {
          if (cancelled.current) throw new Error("cancelled");
          const items = customers.map((customer) => dataFor(template, customer));
          const blob = await pdf(createElement(ReportPdfBundle, { templateId: template.id, items }) as Parameters<typeof pdf>[0]).toBlob();
          files.push({ name: `${safeName(template.title)} - ${customers.length} customers.pdf`, blob });
          done += customers.length;
          setProgress({ done, total: totalPdfs });
        }
        if (files.length === 1) {
          downloadBlob(files[0].blob, files[0].name);
        } else {
          const zip = new JSZip();
          for (const file of files) zip.file(file.name, await file.blob.arrayBuffer());
          downloadBlob(await zip.generateAsync({ type: "blob" }), `customer-forms-${today}.zip`);
        }
        toast.success(files.length === 1 ? "PDF downloaded" : `${files.length} PDFs downloaded`);
        onOpenChange(false);
        return;
      }

      const zip = new JSZip();
      const usedNames = new Set<string>();
      let done = 0;
      for (const template of selectedTemplates) {
        const folder = zip.folder(safeName(template.title))!;
        for (const customer of customers) {
          if (cancelled.current) throw new Error("cancelled");
          const data = dataFor(template, customer);
          const blob = await pdf(createElement(ReportPdfDocument, { templateId: template.id, data }) as Parameters<typeof pdf>[0]).toBlob();
          const base = safeName(`${customer.customerConnection.trBpNo || "no-id"} ${customer.customerConnection.customerName}`);
          let name = `${base}.pdf`;
          for (let n = 2; usedNames.has(`${template.id}/${name}`); n += 1) name = `${base} (${n}).pdf`;
          usedNames.add(`${template.id}/${name}`);
          // Raw bytes: accepted by JSZip in every environment (a Blob is not always).
          folder.file(name, await blob.arrayBuffer());
          done += 1;
          setProgress({ done, total: totalPdfs });
        }
      }

      downloadBlob(await zip.generateAsync({ type: "blob" }), `customer-reports-${today}.zip`);
      toast.success(`${done} PDFs downloaded`);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error && error.message === "cancelled") toast.info("PDF download cancelled");
      else toast.error("Couldn't create the PDFs", { description: error instanceof Error ? error.message : undefined });
    } finally {
      setProgress(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (running) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download PDFs</DialogTitle>
          <DialogDescription>
            {customerIds.length.toLocaleString("en-IN")} selected customers. Pick the forms and how you want them.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          {templates.map((template) => (
            <label key={template.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/60">
              <Checkbox checked={chosen.includes(template.id)} onCheckedChange={() => toggle(template.id)} disabled={running} />
              {template.title}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "combined", title: "One PDF per form", hint: "All customers in one file, ready to print" },
              { value: "separate", title: "Separate files", hint: "ZIP with one PDF per customer" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={running}
              onClick={() => setMode(option.value)}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                mode === option.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
            >
              <span className="block text-sm font-medium text-foreground">{option.title}</span>
              <span className="block text-xs text-muted-foreground">{option.hint}</span>
            </button>
          ))}
        </div>

        {totalPdfs >= LARGE_JOB && !running ? (
          <p className="rounded-lg bg-status-warning-bg px-3 py-2 text-[13px] text-status-warning-fg">
            {totalPdfs.toLocaleString("en-IN")} forms will take a few minutes. Keep this window open until the download starts.
          </p>
        ) : null}

        {running ? (
          <div className="flex flex-col gap-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }} />
            </div>
            <p className="text-[13px] tabular-nums text-muted-foreground">
              Creating forms… {progress.done} / {progress.total}
            </p>
          </div>
        ) : null}

        <DialogFooter>
          {running ? (
            <Button type="button" variant="outline" onClick={() => (cancelled.current = true)}>
              Stop
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button type="button" onClick={generate} disabled={!totalPdfs || running}>
            <FilePdfIcon size={15} />
            {!totalPdfs
              ? "Choose a form"
              : mode === "combined"
                ? `Download ${selectedTemplates.length === 1 ? "PDF" : `${selectedTemplates.length} PDFs`}`
                : `Download ${totalPdfs.toLocaleString("en-IN")} PDFs`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
