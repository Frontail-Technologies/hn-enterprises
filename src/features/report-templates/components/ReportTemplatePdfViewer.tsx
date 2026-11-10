"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { useSearchParams } from "next/navigation";
import { DownloadSimpleIcon, PrinterIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useReportTemplateData } from "../hooks/useReportTemplateData";
import { blankReportTemplateData } from "../services/report-templates.service";
import type { ReportTemplateDefinition } from "../types/report-template.types";
import { ReportPdfDocument } from "./pdf/ReportPdfDocument";

export function ReportTemplatePdfViewer({ template, fieldLabels }: { template: ReportTemplateDefinition; fieldLabels?: Record<string, string> }) {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") ?? undefined;
  const query = useReportTemplateData(template.id, customerId);
  // No customer picked: show the blank paper form instead of nothing.
  const data = customerId ? query.data : blankReportTemplateData(template.id);
  const { isLoading, isError } = query;

  if (customerId && isError) {
    return (
      <div className="flex min-h-[560px] items-center justify-center rounded-card border border-border bg-card shadow-card text-sm text-muted-foreground">
        Unable to load this customer.
      </div>
    );
  }

  if ((customerId && isLoading) || !data) {
    return (
      <div className="flex min-h-[560px] items-center justify-center rounded-card border border-border bg-card shadow-card">
        <LoadingSpinner />
      </div>
    );
  }

  // Saved admin labels replace the default wording on the printed form.
  const document = <ReportPdfDocument templateId={template.id} data={{ ...data, fieldLabels }} />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-card shadow-card p-3">
        <div>
          <p className="text-sm font-semibold text-foreground">A4 PDF Preview</p>
          <p className="text-xs text-muted-foreground">
            {customerId
              ? "Paper-style template generated from real customer data."
              : "Blank form - pick a customer on the templates page to fill it in."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PDFDownloadLink
            document={document}
            fileName={`${template.id}-${customerId ?? "blank"}.pdf`}
            className="app-primary-action inline-flex h-9 items-center gap-2 rounded-sm bg-primary px-3 text-sm font-medium text-white"
          >
            {({ loading }) => (
              <>
                <DownloadSimpleIcon size={15} />
                {loading ? "Preparing..." : "Download PDF"}
              </>
            )}
          </PDFDownloadLink>
          <Button variant="outline" onClick={() => window.print()}>
            <PrinterIcon size={15} />
            Print
          </Button>
        </div>
      </div>

      <div className="h-[calc(100vh-230px)] min-h-[620px] overflow-hidden rounded-sm border border-border bg-muted">
        <PDFViewer width="100%" height="100%" showToolbar>
          {document}
        </PDFViewer>
      </div>
    </div>
  );
}
