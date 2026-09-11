"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { useSitePlansQuery } from "../hooks/usePlanning";
import { planningTaskTemplates } from "../services/planning.service";
import type { PlanTask } from "../types/planning.types";
import { PageLoading } from "@/components/shared/PageLoading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PlanningPlanPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") ?? "";
  const supervisorId = searchParams.get("supervisorId") ?? "";
  const date = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

  const { data: sitePlans = [], isLoading } = useSitePlansQuery({ customerId, supervisorId, date });
  const plan = sitePlans[0];
  const tasks = plan?.tasks ?? planningTaskTemplates.map((template) => ({ ...template, qty: "", worker: "" }));
  const siteLabel = plan?.siteLabel || "Unknown site";
  const supervisorName = plan?.supervisorName || "Unknown supervisor";
  const customerName = plan?.customerName || "Unknown customer";

  const totalQty = useMemo(
    () => tasks.reduce((sum, task) => sum + (Number(task.qty) || 0), 0),
    [tasks],
  );

  return (
    <PageShell
      title="Planning"
      actions={
        <Link
          href={`/planning/dpr?supervisorId=${supervisorId}&customerId=${customerId}&date=${date}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Open DPR
        </Link>
      }
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg border border-border/70 bg-card px-3 py-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Supervisor</p>
            <p className="text-sm font-semibold text-foreground">{supervisorName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Customer</p>
            <p className="text-sm font-semibold text-foreground">{customerName}</p>
          </div>
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
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow className="bg-table-header/80 text-xs font-semibold text-muted-foreground">
            <TableHead>Task</TableHead>
            <TableHead className="w-28">Qty</TableHead>
            <TableHead className="w-64">Plumber / Labour</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="bg-card">
              <TableCell className="whitespace-normal font-medium text-foreground">
                {task.label}
              </TableCell>
              <TableCell className="text-center">{task.qty || "-"}</TableCell>
              <TableCell className="whitespace-normal">{task.worker || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
