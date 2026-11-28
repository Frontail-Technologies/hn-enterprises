"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageShell } from "@/components/shared/PageShell";
import { useEffectiveReportTemplate } from "../hooks/useReportTemplateOverrides";
import type { ReportTemplateId } from "../types/report-template.types";

const ReportTemplatePdfViewer = dynamic(
  () => import("./ReportTemplatePdfViewer").then((module) => module.ReportTemplatePdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[560px] items-center justify-center rounded-card border border-border bg-card shadow-card">
        <LoadingSpinner />
      </div>
    ),
  },
);

export function ReportTemplatePreviewShell({ templateId }: { templateId: ReportTemplateId }) {
  const router = useRouter();
  const { template } = useEffectiveReportTemplate(templateId);

  if (!template) {
    return (
      <EmptyState
        illustration="error"
        title="Template not found"
        description="It may have been renamed or removed."
        action={{ label: "Back to templates", onClick: () => router.push("/reports/templates") }}
      />
    );
  }

  return (
    <PageShell
      title={template.title}
      description={template.description}
      actions={
        <>
          <Link href={`/reports/templates/${template.id}/edit`} className={buttonVariants({ variant: "outline" })}>
            <PencilSimpleIcon size={15} />
            Edit template
          </Link>
        </>
      }
    >
      <ReportTemplatePdfViewer template={template} fieldLabels={template.fieldLabels} />
    </PageShell>
  );
}
