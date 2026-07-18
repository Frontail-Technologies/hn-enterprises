"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeftIcon, EditIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getReportTemplateById } from "../services/report-templates.service";
import type { ReportTemplateId } from "../types/report-template.types";

const ReportTemplatePdfViewer = dynamic(
  () => import("./ReportTemplatePdfViewer").then((module) => module.ReportTemplatePdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[560px] items-center justify-center rounded-sm border border-border bg-card text-sm text-muted-foreground">
        Loading PDF preview...
      </div>
    ),
  },
);

export function ReportTemplatePreviewShell({ templateId }: { templateId: ReportTemplateId }) {
  const template = getReportTemplateById(templateId);

  if (!template) {
    return (
      <div className="rounded-sm border border-border bg-card p-6">
        <p className="text-sm font-semibold text-foreground">Template not found</p>
        <Link href="/reports/templates" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
          Back to templates
        </Link>
      </div>
    );
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
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{template.title}</h1>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
        <Link
          href={`/reports/templates/${template.id}/edit`}
          className={buttonVariants({ variant: "outline" })}
        >
          <EditIcon size={15} />
          Edit Template
        </Link>
      </div>

      <ReportTemplatePdfViewer template={template} />
    </div>
  );
}
