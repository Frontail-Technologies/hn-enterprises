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

/**
 * Bulk PDFs: for every selected customer, the chosen report templates, all in
 * one ZIP (one folder per template). Uses each customer's project details and
 * the saved template labels, exactly like the single preview.
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
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const cancelled = useRef(false);

  const selectedTemplates = templates.filter((template) => chosen.includes(template.id));
  const totalPdfs = selectedTemplates.length * customerIds.length;
  const running = progress !== null;

  function toggle(id: string) {
    setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function generate() {
    cancelled.current = false;
    setProgress({ done: 0, total: totalPdfs });
    try {
      const [{ pdf }, { ReportPdfDocument }, { default: JSZip }] = await Promise.all([
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

      const zip = new JSZip();
      const usedNames = new Set<string>();
      let done = 0;
      for (const template of selectedTemplates) {
        const folder = zip.folder(safeName(template.title))!;
        for (const customer of customers) {
          if (cancelled.current) throw new Error("cancelled");
          const data = {
            ...resolveReportTemplateDataFromCustomer(template.id, customer, projects.get(customer.projectId)),
            fieldLabels: template.fieldLabels,
          };
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

      const archive = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      link.href = url;
      link.download = `customer-reports-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
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
            {customerIds.length.toLocaleString("en-IN")} selected customers. Pick the forms you need - you get one ZIP with a folder per form.
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

        {totalPdfs >= LARGE_JOB && !running ? (
          <p className="rounded-lg bg-status-warning-bg px-3 py-2 text-[13px] text-status-warning-fg">
            {totalPdfs.toLocaleString("en-IN")} PDFs will take a few minutes. Keep this window open until the download starts.
          </p>
        ) : null}

        {running ? (
          <div className="flex flex-col gap-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }} />
            </div>
            <p className="text-[13px] tabular-nums text-muted-foreground">
              Creating PDFs… {progress.done} / {progress.total}
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
            {totalPdfs ? `Download ${totalPdfs.toLocaleString("en-IN")} PDFs` : "Choose a form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
