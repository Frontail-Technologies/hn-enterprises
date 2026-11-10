"use client";

import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageShell } from "@/components/shared/PageShell";

export function ReportsPage() {
  const router = useRouter();
  return (
    <PageShell title="Reports" description="Generated reports, saved exports and scheduled summaries.">
      <div className="rounded-card border border-border bg-card shadow-card">
        <EmptyState
          illustration="documents"
          title="Reports module coming soon"
          description="Generated reports, saved exports and scheduled operational summaries will be configured here. Field report templates are ready to use now."
          action={{ label: "Open templates", onClick: () => router.push("/reports/templates") }}
        />
      </div>
    </PageShell>
  );
}
