"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FilePdfIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageShell } from "@/components/shared/PageShell";
import { DprGeneratedPreview } from "./DprGeneratedPreview";
import {
  createDprTasks,
  getPlanningSupervisorById,
} from "../services/planning.service";

export function PlanningDprPage() {
  const searchParams = useSearchParams();
  const supervisor = getPlanningSupervisorById(searchParams.get("supervisor"));
  const siteLabel = searchParams.get("site") ?? supervisor.area;
  const date = searchParams.get("date") ?? "2026-07-22";
  const remarks = "Daily work submitted by supervisor.";
  const tasks = useMemo(() => createDprTasks(), []);
  const [previewOpen, setPreviewOpen] = useState(false);

  const totalCompleted = useMemo(
    () => tasks.reduce((sum, item) => sum + (Number(item.completedQty) || 0), 0),
    [tasks],
  );

  return (
    <PageShell
      title="DPR"
      subtitle={`${supervisor.name} - ${siteLabel}`}
      actions={
        <>
          <Link
            href={`/planning/plan?supervisor=${supervisor.id}&site=${encodeURIComponent(siteLabel)}&date=${date}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Open Planning
          </Link>
          <Button type="button" onClick={() => setPreviewOpen(true)}>
            <FilePdfIcon size={15} />
            Generate DPR
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg border border-border/70 bg-card px-3 py-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">DPR Date</p>
            <p className="text-sm font-semibold text-foreground">{date}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{siteLabel}</p>
            <p className="text-sm font-semibold text-primary">{totalCompleted} completed</p>
          </div>
        </div>

        <section className="rounded-lg border border-border/70 bg-card">
          <div className="border-b border-border/70 px-3 py-2">
            <h2 className="text-sm font-semibold text-foreground">DPR Work Items</h2>
            <p className="text-xs text-muted-foreground">
              Compact entry view for selected supervisor and site.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="bg-secondary/80 text-xs font-semibold text-muted-foreground">
                  <th className="border border-border/60 px-3 py-2 text-left">Task</th>
                  <th className="w-28 border border-border/60 px-3 py-2 text-left">Planned</th>
                  <th className="w-32 border border-border/60 px-3 py-2 text-left">Completed</th>
                  <th className="w-56 border border-border/60 px-3 py-2 text-left">Plumber / Labour</th>
                  <th className="w-72 border border-border/60 px-3 py-2 text-left">Delay Reason</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="bg-card">
                    <td className="border border-border/55 px-3 py-2 font-medium text-foreground">
                      {task.label}
                    </td>
                    <td className="border border-border/55 px-3 py-2 text-center">
                      {task.plannedQty || "-"}
                    </td>
                    <td className="border border-border/55 px-3 py-2 text-center">
                      {task.completedQty || "-"}
                    </td>
                    <td className="border border-border/55 px-3 py-2">
                      {task.worker || "-"}
                    </td>
                    <td className="border border-border/55 px-3 py-2">
                      {task.delayReason || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Supervisor Remarks</p>
          <p className="mt-1 text-sm text-foreground">{remarks || "-"}</p>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[min(1180px,calc(100vw-2rem))] !max-w-[min(1180px,calc(100vw-2rem))]">
          <DialogHeader>
            <DialogTitle>Generated DPR Preview</DialogTitle>
            <DialogDescription>
              Preview generated from current DPR page data.
            </DialogDescription>
          </DialogHeader>
          <DprGeneratedPreview
            date={date}
            siteAddress={siteLabel}
            tasks={tasks}
            remarks={remarks}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
