"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

export function ReportsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Reports" subtitle="Operational reports and exports." />
      <div className="rounded-xl border border-border/70 bg-card p-8">
        <div className="mx-auto max-w-md text-center">
          <p className="text-base font-semibold text-foreground">
            Reports module coming soon
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            Generated reports, saved exports and scheduled operational summaries
            will be configured here.
          </p>
          <Link
            href="/reports/templates"
            className={buttonVariants({ className: "mt-5" })}
          >
            Open Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
