import { useQuery } from "@tanstack/react-query";
import { resolveReportTemplateData } from "../services/report-templates.service";
import type { ReportTemplateId } from "../types/report-template.types";

export function useReportTemplateData(templateId: ReportTemplateId, customerId: string | undefined) {
  return useQuery({
    queryKey: ["report-template-data", templateId, customerId],
    queryFn: () => resolveReportTemplateData(templateId, customerId as string),
    enabled: Boolean(customerId),
  });
}
