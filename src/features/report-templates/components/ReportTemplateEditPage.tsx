"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowCounterClockwiseIcon, EyeIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StickyFormFooter } from "@/components/shared/StickyFormFooter";
import { useReportTemplateData } from "../hooks/useReportTemplateData";
import {
  useEffectiveReportTemplate,
  useResetReportTemplate,
  useSaveReportTemplate,
  type EffectiveReportTemplate,
} from "../hooks/useReportTemplateOverrides";
import { getReportTemplateById } from "../services/report-templates.service";
import { FIELD_INFO, TEMPLATE_FIELDS } from "../template-fields";
import type { ReportTemplateId } from "../types/report-template.types";

export function ReportTemplateEditPage({ templateId }: { templateId: ReportTemplateId }) {
  const router = useRouter();
  const { template, isLoading, isError } = useEffectiveReportTemplate(templateId);

  if (!template) {
    return (
      <div className="rounded-card border border-border bg-card shadow-card">
        <EmptyState
          illustration="documents"
          title="Template not found"
          description="It may have been renamed or removed."
          action={{ label: "Back to templates", onClick: () => router.push("/reports/templates") }}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // The form seeds its state from the saved edits, so remount it whenever they change
  // (after a save or reset) instead of trying to sync state by hand.
  return (
    <TemplateEditForm
      key={template.override?.updatedAt ?? "default"}
      template={template}
      loadFailed={isError}
    />
  );
}

function TemplateEditForm({ template, loadFailed }: { template: EffectiveReportTemplate; loadFailed: boolean }) {
  const defaults = getReportTemplateById(template.id)!;
  const fields = TEMPLATE_FIELDS[template.id];
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") ?? undefined;
  const { data } = useReportTemplateData(template.id, customerId);
  const save = useSaveReportTemplate(template.id);
  const reset = useResetReportTemplate(template.id);

  const [title, setTitle] = useState(template.override?.title ?? "");
  const [category, setCategory] = useState(template.override?.category ?? "");
  const [description, setDescription] = useState(template.override?.description ?? "");
  const [labels, setLabels] = useState<Record<string, string>>(template.fieldLabels);

  const isBusy = save.isPending || reset.isPending;
  const previewHref = `/reports/templates/${template.id}${customerId ? `?customerId=${customerId}` : ""}`;
  const savedAt = template.override ? new Date(template.override.updatedAt) : null;

  async function handleSave() {
    try {
      await save.mutateAsync({ title, category, description, fieldLabels: labels });
      toast.success("Template saved", { description: "Every preview and PDF now uses these labels." });
    } catch (error) {
      toast.error("Couldn't save template", { description: error instanceof Error ? error.message : undefined });
    }
  }

  async function handleReset() {
    try {
      await reset.mutateAsync();
      toast.success("Template reset to default wording");
    } catch (error) {
      toast.error("Couldn't reset template", { description: error instanceof Error ? error.message : undefined });
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-20">
      <PageHeader
        title="Edit template"
        description="Rename the template and change the labels printed on the form. Saved for every admin."
        actions={
          <>
            <Link href={previewHref} className={buttonVariants({ variant: "outline" })}>
              <EyeIcon size={15} />
              Preview
            </Link>
          </>
        }
      />

      {loadFailed ? (
        <p className="rounded-lg border border-status-warning/30 bg-status-warning-bg px-3 py-2 text-[13px] text-status-warning-fg">
          Saved edits couldn&apos;t be loaded, so the default wording is shown. Saving now will replace any saved edits.
        </p>
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard title="Template details" description="Leave a field empty to keep the default.">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="template-title" className="text-xs">Title</Label>
              <Input id="template-title" value={title} placeholder={defaults.title} maxLength={200} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="template-category" className="text-xs">Category</Label>
              <Input id="template-category" value={category} placeholder={defaults.category} maxLength={80} onChange={(event) => setCategory(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="template-description" className="text-xs">Description</Label>
              <Textarea
                id="template-description"
                value={description}
                placeholder={defaults.description}
                maxLength={1000}
                rows={4}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            {!customerId ? (
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                Pick a customer on the templates page to see real sample values next to each label.
              </p>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Printed labels"
          description="Change the wording printed beside each value. Where the value comes from is fixed."
          className="min-w-0 overflow-hidden"
        >
          {fields.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">This template has no customer fields to relabel.</p>
          ) : (
            <div className="-mx-5 -mb-5 overflow-x-auto border-t border-border">
              <Table className="min-w-[760px]">
                <TableHeader className="bg-surface-muted text-xs font-semibold text-muted-foreground">
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Printed label</TableHead>
                    <TableHead>Data source</TableHead>
                    <TableHead>Sample value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field) => {
                    const info = FIELD_INFO[field.key];
                    const sample = data?.[field.key];
                    return (
                      <TableRow key={field.key} className="align-top">
                        <TableCell className="w-[120px] text-xs font-medium text-muted-foreground">{info.section}</TableCell>
                        <TableCell className="w-[240px]">
                          <Input
                            aria-label={`Label for ${field.defaultLabel}`}
                            value={labels[field.key] ?? ""}
                            placeholder={field.defaultLabel}
                            maxLength={120}
                            className="h-8"
                            onChange={(event) => setLabels((current) => ({ ...current, [field.key]: event.target.value }))}
                          />
                        </TableCell>
                        <TableCell className="w-[260px] whitespace-normal break-all font-mono text-[11px] text-muted-foreground">
                          {info.source}
                        </TableCell>
                        <TableCell className="whitespace-normal text-sm text-foreground">
                          {sample ? String(sample) : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>
      </div>

      <StickyFormFooter
        start={
          savedAt
            ? `Last saved ${savedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
            : "Using default wording"
        }
      >
        {template.override ? (
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="ghost" disabled={isBusy} />}>
              <ArrowCounterClockwiseIcon size={15} />
              Reset to default
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset this template?</AlertDialogTitle>
                <AlertDialogDescription>
                  The saved title, description and labels are removed for every admin, and the form prints its original
                  wording again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
        <Link href="/reports/templates" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
        <Button onClick={handleSave} disabled={isBusy}>
          <FloppyDiskIcon size={15} />
          {save.isPending ? "Saving..." : "Save template"}
        </Button>
      </StickyFormFooter>
    </div>
  );
}
