import Link from "next/link";
import { DownloadIcon, EditIcon, EyeIcon, FileTextIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { reportTemplates } from "../services/report-templates.service";

export function ReportTemplatesPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Preview, print and download frontend-generated field report templates.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {reportTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-sm border border-border bg-card p-4 transition hover:border-primary/45 hover:bg-primary/5"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-primary/20 bg-primary/10 text-primary">
                <FileTextIcon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-xs font-medium text-primary">{template.category}</span>
                <span className="mt-1 block text-sm font-semibold text-foreground">
                  {template.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {template.description}
                </span>
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/reports/templates/${template.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <EyeIcon size={14} />
                Preview
              </Link>
              <Link
                href={`/reports/templates/${template.id}/edit`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <EditIcon size={14} />
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-sm border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Template data source</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Current templates are generated from customer, JMR, pressure testing and GC mock records.
            </p>
          </div>
          <Link
            href="/reports/templates/jmr-customer-consent"
            className={buttonVariants({ variant: "outline" })}
          >
            <DownloadIcon size={15} />
            Open first template
          </Link>
        </div>
      </div>
    </div>
  );
}
