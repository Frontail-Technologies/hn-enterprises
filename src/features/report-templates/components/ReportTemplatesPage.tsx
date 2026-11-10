"use client";

import { useState } from "react";
import Link from "next/link";
import { EyeIcon, FileTextIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useCustomerSelectorOptions } from "@/features/customers/hooks/useCustomerSelectorOptions";
import { useEffectiveReportTemplates } from "../hooks/useReportTemplateOverrides";

export function ReportTemplatesPage() {
  const [customerId, setCustomerId] = useState("");
  const { options, isLoading, onSearchChange } = useCustomerSelectorOptions(customerId);
  const { templates } = useEffectiveReportTemplates();

  const query = customerId ? `?customerId=${customerId}` : "";

  return (
    <PageShell
      title="Report templates"
      description="Preview, print and download field report templates generated from real customer data."
    >
      <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-5 shadow-card sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-card-title">Customer</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
            Pick a customer to fill the templates with. Fields with no real data source (for example pressure-test
            readings or JMR/GC remarks) print blank rather than invented.
          </p>
        </div>
        <SearchableSelect
          value={customerId}
          onValueChange={setCustomerId}
          placeholder="Select a customer"
          searchPlaceholder="Search by name, BR/TR or mobile..."
          options={options}
          isLoading={isLoading}
          onSearchChange={onSearchChange}
          className="h-9 w-full shrink-0 sm:w-80"
        />
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article
            key={template.id}
            className="group flex flex-col gap-4 rounded-card border border-border bg-card p-5 shadow-card transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-floating"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <FileTextIcon size={19} weight="duotone" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-card-title">
                  {template.title}
                  {template.override ? <span className="ms-1.5 text-xs font-normal text-muted-foreground">· Edited</span> : null}
                </h3>
              </div>
            </div>
            <div className="mt-auto flex items-center gap-2">
              <Link href={`/reports/templates/${template.id}${query}`} className={buttonVariants({ variant: "outline", size: "compact" })}>
                <EyeIcon size={14} />
                Preview
              </Link>
              <Link href={`/reports/templates/${template.id}/edit${query}`} className={buttonVariants({ variant: "ghost", size: "compact" })}>
                <PencilSimpleIcon size={14} />
                Edit
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
