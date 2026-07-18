import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportTemplatePreviewShell } from "@/features/report-templates/components/ReportTemplatePreviewShell";
import { getReportTemplateById } from "@/features/report-templates/services/report-templates.service";
import type { ReportTemplateId } from "@/features/report-templates/types/report-template.types";

type PageProps = {
  params: Promise<{ templateId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { templateId } = await params;
  const template = getReportTemplateById(templateId);

  return {
    title: template?.title ?? "Report Template",
  };
}

export default async function Page({ params }: PageProps) {
  const { templateId } = await params;
  const template = getReportTemplateById(templateId);

  if (!template) {
    notFound();
  }

  return <ReportTemplatePreviewShell templateId={template.id as ReportTemplateId} />;
}
