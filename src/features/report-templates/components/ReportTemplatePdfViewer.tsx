"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { DownloadIcon, PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resolveReportTemplateData,
} from "../services/report-templates.service";
import type { ReportTemplateDefinition } from "../types/report-template.types";
import { ReportPdfDocument } from "./pdf/ReportPdfDocument";

export function ReportTemplatePdfViewer({ template }: { template: ReportTemplateDefinition }) {
  const data = resolveReportTemplateData(template.id, template.defaultCustomerId, template.defaultRecordId);
  const document = <ReportPdfDocument templateId={template.id} data={data} />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card p-3">
        <div>
          <p className="text-sm font-semibold text-foreground">A4 PDF Preview</p>
          <p className="text-xs text-muted-foreground">
            Paper-style template generated from current mock customer and operational records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PDFDownloadLink
            document={document}
            fileName={`${template.id}.pdf`}
            className="app-primary-action inline-flex h-9 items-center gap-2 rounded-sm bg-primary px-3 text-sm font-medium text-white"
          >
            {({ loading }) => (
              <>
                <DownloadIcon size={15} />
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
