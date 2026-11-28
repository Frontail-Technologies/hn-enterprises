"use client";

import { useState } from "react";
import Link from "next/link";
import { format, startOfMonth } from "date-fns";
import { FileTextIcon } from "@phosphor-icons/react";
import { DatePicker } from "@/components/shared/DatePicker";
import { PageShell } from "@/components/shared/PageShell";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { buttonVariants } from "@/components/ui/button";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { projectOption } from "@/features/projects/utils/project-option";
import { useUrlTab } from "@/hooks/useUrlTab";
import type { ReportFilters } from "../types";
import { BillingReport } from "./BillingReport";
import { MaterialReport } from "./MaterialReport";
import { PeopleReport } from "./PeopleReport";
import { ProgressReport } from "./ProgressReport";

const TABS = [
  { id: "progress", label: "Work progress" },
  { id: "people", label: "Plumbers & Labour" },
  { id: "material", label: "Material" },
  { id: "billing", label: "Billing" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/**
 * HN's own reports (not client paperwork): one date range and project filter
 * shared by every tab, each with its own summary, table and Excel export.
 */
export function ReportsHubPage() {
  const [tab, setTab] = useUrlTab<TabId>(TABS.map((item) => item.id), "progress");
  const { data: projects = [] } = useProjectsQuery();
  const [filters, setFilters] = useState<ReportFilters>(() => ({
    from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
    projectId: "",
  }));
  const set = (patch: Partial<ReportFilters>) => setFilters((current) => ({ ...current, ...patch }));

  return (
    <PageShell
      title="Reports"
      description="Work, people, material and billing for any period."
      actions={
        <Link href="/reports/templates" className={buttonVariants({ variant: "outline", size: "compact" })}>
          <FileTextIcon size={14} />
          Customer forms
        </Link>
      }
      tabs={<UnderlineTabs items={[...TABS]} active={tab} onChange={(id) => setTab(id as TabId)} />}
    >
      <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-card px-3 py-2.5 shadow-card">
        <span className="text-xs font-medium text-muted-foreground">Period</span>
        <DatePicker value={filters.from} onChange={(from) => set({ from })} className="h-8 w-36" />
        <span className="text-xs text-muted-foreground">to</span>
        <DatePicker value={filters.to} onChange={(to) => set({ to })} className="h-8 w-36" />
        <span className="ml-2 text-xs font-medium text-muted-foreground">Project</span>
        <SearchableSelect
          value={filters.projectId || "all"}
          onValueChange={(value) => set({ projectId: !value || value === "all" ? "" : value })}
          options={[{ value: "all", label: "All projects" }, ...projects.map(projectOption)]}
          placeholder="All projects"
          searchPlaceholder="Search projects..."
          className="h-8 w-full text-[13px] sm:w-56"
        />
      </div>

      {tab === "progress" ? <ProgressReport filters={filters} /> : null}
      {tab === "people" ? <PeopleReport filters={filters} /> : null}
      {tab === "material" ? <MaterialReport filters={filters} /> : null}
      {tab === "billing" ? <BillingReport filters={filters} /> : null}
    </PageShell>
  );
}
