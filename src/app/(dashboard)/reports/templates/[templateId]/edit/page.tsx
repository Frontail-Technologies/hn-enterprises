import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportTemplateEditPage } from "@/features/report-templates/components/ReportTemplateEditPage";
import { getReportTemplateById } from "@/features/report-templates/services/report-templates.service";
import type { ReportTemplateId } from "@/features/report-templates/types/report-template.types";

type PageProps = {
  params: Promise<{ templateId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { templateId } = await params;
  const template = getReportTemplateById(templateId);

  return {
    title: template ? `Edit ${template.title}` : "Edit Report Template",
  };
}

export default async function Page({ params }: PageProps) {
  const { templateId } = await params;
  const template = getReportTemplateById(templateId);

  if (!template) {
    notFound();
  }

  return <ReportTemplateEditPage templateId={template.id as ReportTemplateId} />;
}
