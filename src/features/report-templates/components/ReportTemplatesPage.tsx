"use client";

import { useState } from "react";
import Link from "next/link";
import { EyeIcon, FileTextIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useCustomerSelectorOptions } from "@/features/customers/hooks/useCustomerSelectorOptions";
import { reportTemplates } from "../services/report-templates.service";

export function ReportTemplatesPage() {
  const [customerId, setCustomerId] = useState("");
  const { options, isLoading, onSearchChange } = useCustomerSelectorOptions(customerId);

  const query = customerId ? `?customerId=${customerId}` : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Preview, print and download field report templates generated from real customer data.
          </p>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">Customer</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a customer to generate reports for. Fields with no real data source (e.g. pressure
          test readings, JMR/GC remarks) print blank rather than fabricated.
        </p>
        <SearchableSelect
          value={customerId}
          onValueChange={setCustomerId}
          placeholder="Select a customer"
          searchPlaceholder="Search by name, BR/TR or mobile..."
          options={options}
          isLoading={isLoading}
          onSearchChange={onSearchChange}
          className="mt-3 h-9 w-full max-w-sm bg-card text-sm"
        />
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
                href={`/reports/templates/${template.id}${query}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <EyeIcon size={14} />
                Preview
              </Link>
              <Link
                href={`/reports/templates/${template.id}/edit${query}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <PencilSimpleIcon size={14} />
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
