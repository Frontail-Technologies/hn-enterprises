import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { getReportTemplateById, reportTemplates } from "../services/report-templates.service";
import type { ReportTemplateDefinition, ReportTemplateId } from "../types/report-template.types";

/** Admin edits saved on the server for one template (GET/PUT/DELETE /report-templates). */
export type ReportTemplateOverride = {
  templateId: string;
  title: string | null;
  category: string | null;
  description: string | null;
  fieldLabels: Record<string, string>;
  updatedAt: string;
};

export type ReportTemplateOverrideInput = {
  title: string;
  category: string;
  description: string;
  fieldLabels: Record<string, string>;
};

/** A built-in template with any saved admin edits applied. */
export type EffectiveReportTemplate = ReportTemplateDefinition & {
  /** Display category (saved edits may use any text). */
  categoryLabel: string;
  fieldLabels: Record<string, string>;
  override?: ReportTemplateOverride;
};

const overridesKey = ["report-template-overrides"] as const;

export function applyOverride(template: ReportTemplateDefinition, override?: ReportTemplateOverride): EffectiveReportTemplate {
  return {
    ...template,
    title: override?.title || template.title,
    description: override?.description || template.description,
    categoryLabel: override?.category || template.category,
    fieldLabels: override?.fieldLabels ?? {},
    override,
  };
}

export function useReportTemplateOverrides() {
  return useQuery({
    queryKey: overridesKey,
    queryFn: () => apiRequest<ReportTemplateOverride[]>("/report-templates"),
    staleTime: 60_000,
  });
}

/** All templates with saved edits applied (defaults while loading or on error). */
export function useEffectiveReportTemplates() {
  const query = useReportTemplateOverrides();
  const byId = new Map((query.data ?? []).map((row) => [row.templateId, row]));
  return { ...query, templates: reportTemplates.map((template) => applyOverride(template, byId.get(template.id))) };
}

export function useEffectiveReportTemplate(templateId: ReportTemplateId) {
  const query = useReportTemplateOverrides();
  const base = getReportTemplateById(templateId);
  const override = query.data?.find((row) => row.templateId === templateId);
  return { ...query, template: base ? applyOverride(base, override) : undefined };
}

export function useSaveReportTemplate(templateId: ReportTemplateId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReportTemplateOverrideInput) =>
      apiRequest<ReportTemplateOverride>(`/report-templates/${templateId}`, { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: overridesKey }),
  });
}

export function useResetReportTemplate(templateId: ReportTemplateId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<{ templateId: string }>(`/report-templates/${templateId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: overridesKey }),
  });
}
