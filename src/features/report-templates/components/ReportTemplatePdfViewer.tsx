"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DownloadIcon, PrinterIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useReportTemplateData } from "../hooks/useReportTemplateData";
import type { ReportTemplateDefinition } from "../types/report-template.types";
import { ReportPdfDocument } from "./pdf/ReportPdfDocument";

export function ReportTemplatePdfViewer({ template }: { template: ReportTemplateDefinition }) {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") ?? undefined;
  const { data, isLoading, isError } = useReportTemplateData(template.id, customerId);

  if (!customerId) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-sm border border-border bg-card text-center">
        <p className="text-sm font-semibold text-foreground">Pick a customer first</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          This template needs a real customer to generate a report for. Select one from the templates list.
        </p>
        <Link href="/reports/templates" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to templates
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[560px] items-center justify-center rounded-sm border border-border bg-card text-sm text-muted-foreground">
        Unable to load this customer.
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[560px] items-center justify-center rounded-sm border border-border bg-card">
        <LoadingSpinner />
      </div>
    );
  }

  const document = <ReportPdfDocument templateId={template.id} data={data} />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card p-3">
        <div>
          <p className="text-sm font-semibold text-foreground">A4 PDF Preview</p>
          <p className="text-xs text-muted-foreground">
            Paper-style template generated from real customer data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PDFDownloadLink
            document={document}
            fileName={`${template.id}-${customerId}.pdf`}
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
