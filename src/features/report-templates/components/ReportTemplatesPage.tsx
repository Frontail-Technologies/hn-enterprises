"use client";

import { useState } from "react";
import Link from "next/link";
import { EditIcon, EyeIcon, FileTextIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { reportTemplates } from "../services/report-templates.service";

export function ReportTemplatesPage() {
  const { data: customers = [], isLoading } = useCustomersQuery();
  const [customerId, setCustomerId] = useState("");

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
        <Select value={customerId} onValueChange={(value) => setCustomerId(value ?? "")}>
          <SelectTrigger className="mt-3 h-9 w-full max-w-sm bg-card text-sm">
            <SelectValue placeholder={isLoading ? "Loading customers..." : "Select a customer"} />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.customerConnection.customerName} : {customer.customerConnection.trBpNo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <EditIcon size={14} />
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
