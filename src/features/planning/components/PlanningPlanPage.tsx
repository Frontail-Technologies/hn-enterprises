"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { useSitePlansQuery } from "../hooks/usePlanning";
import { planningTaskTemplates } from "../services/planning.service";
import type { PlanTask } from "../types/planning.types";
import { PageLoading } from "@/components/shared/PageLoading";

export function PlanningPlanPage() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId") ?? "";
  const supervisorId = searchParams.get("supervisorId") ?? "";
  const date = searchParams.get("date") ?? "2026-07-22";

  const { data: sitePlans = [], isLoading } = useSitePlansQuery({ siteId, supervisorId, date });
  const plan = sitePlans[0];
  const tasks = plan?.tasks ?? planningTaskTemplates.map((template) => ({ ...template, qty: "", worker: "" }));
  const siteLabel = plan?.siteLabel || "Unknown site";
  const supervisorName = plan?.supervisorName || "Unknown supervisor";

  const totalQty = useMemo(
    () => tasks.reduce((sum, task) => sum + (Number(task.qty) || 0), 0),
    [tasks],
  );

  return (
    <PageShell
      title="Planning"
      subtitle={`${supervisorName} - ${siteLabel}`}
      actions={
        <Link
          href={`/planning/dpr?supervisorId=${supervisorId}&siteId=${siteId}&date=${date}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Open DPR
        </Link>
      }
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg border border-border/70 bg-card px-3 py-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Plan Date</p>
            <p className="text-sm font-semibold text-foreground">{date}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Planned Qty</p>
            <p className="text-sm font-semibold text-primary">{totalQty}</p>
          </div>
        </div>

        {isLoading ? (
          <PageLoading className="min-h-24 rounded-lg border border-border/70 bg-card" />
        ) : !plan ? (
          <p className="rounded-lg border border-border/70 bg-card px-3 py-4 text-sm text-muted-foreground">
            No plan filed for this site and date yet.
          </p>
        ) : (
          <PlanningTaskTable siteLabel={siteLabel} tasks={tasks} />
        )}
      </div>
    </PageShell>
  );
}

function PlanningTaskTable({
  siteLabel,
  tasks,
}: {
  siteLabel: string;
  tasks: PlanTask[];
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card">
      <div className="border-b border-border/70 px-3 py-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Site Plan</h2>
          <p className="text-xs text-muted-foreground">{siteLabel}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-secondary/80 text-xs font-semibold text-muted-foreground">
              <th className="border border-border/60 px-3 py-2 text-left">Task</th>
              <th className="w-28 border border-border/60 px-3 py-2 text-left">Qty</th>
              <th className="w-64 border border-border/60 px-3 py-2 text-left">Plumber / Labour</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="bg-card">
                <td className="border border-border/55 px-3 py-2 font-medium text-foreground">
                  {task.label}
                </td>
                <td className="border border-border/55 px-3 py-2 text-center">
                  {task.qty || "-"}
                </td>
                <td className="border border-border/55 px-3 py-2">
                  {task.worker || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
