"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { FilePdfIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageShell } from "@/components/shared/PageShell";
import { resolveFileUrl } from "@/lib/upload";
import { DprGeneratedPreview } from "./DprGeneratedPreview";
import { useDprRecordsQuery } from "../hooks/usePlanning";
import { PageLoading } from "@/components/shared/PageLoading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PlanningDprPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") ?? "";
  const supervisorId = searchParams.get("supervisorId") ?? "";
  const date = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

  const { data: dprRecords = [], isLoading } = useDprRecordsQuery({ customerId, supervisorId, date });
  const record = dprRecords[0];
  const [previewOpen, setPreviewOpen] = useState(false);

  const tasks = useMemo(() => record?.tasks ?? [], [record]);
  const remarks = record?.remarks ?? "";
  const siteLabel = record?.siteLabel || "Unknown site";
  const supervisorName = record?.supervisorName || "Unknown supervisor";
  const customerName = record?.customerName || "Unknown customer";

  const totalCompleted = useMemo(
    () => tasks.reduce((sum, item) => sum + (Number(item.completedQty) || 0), 0),
    [tasks],
  );

  return (
    <PageShell
      title="DPR"
      actions={
        <div className={cn("grid gap-2 sm:contents", record ? "grid-cols-2" : "grid-cols-1")}>
          <Link
            href={`/planning/plan?supervisorId=${supervisorId}&customerId=${customerId}&date=${date}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Open Planning
          </Link>
          {record ? (
            <Button type="button" onClick={() => setPreviewOpen(true)}>
              <FilePdfIcon size={15} />
              Generate DPR
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-3">
        {isLoading ? (
          <PageLoading className="min-h-24 rounded-lg border border-border/70 bg-card" />
        ) : (
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
              <p className="text-xs font-medium text-muted-foreground">DPR Date</p>
              <p className="text-sm font-semibold text-foreground">{date}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{siteLabel}</p>
              <p className="text-sm font-semibold text-primary">{totalCompleted} completed</p>
            </div>
          </div>
        )}

        {isLoading ? null : !record ? (
          <p className="rounded-lg border border-border/70 bg-card px-3 py-4 text-sm text-muted-foreground">
            No DPR filed for this site and date yet.
          </p>
        ) : (
          <>
            <section className="rounded-lg border border-border/70 bg-card">
              <div className="border-b border-border/70 px-3 py-2">
                <h2 className="text-sm font-semibold text-foreground">DPR Work Items</h2>
                <p className="text-xs text-muted-foreground">
                  Compact entry view for selected supervisor and site.
                </p>
              </div>
              <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow className="bg-table-header/80 text-xs font-semibold text-muted-foreground">
                    <TableHead>Task</TableHead>
                    <TableHead className="w-28">Planned</TableHead>
                    <TableHead className="w-32">Completed</TableHead>
                    <TableHead className="w-56">Plumber / Labour</TableHead>
                    <TableHead className="w-72">Delay Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id} className="bg-card">
                      <TableCell className="whitespace-normal font-medium text-foreground">
                        {task.label}
                      </TableCell>
                      <TableCell className="text-center">
                        {task.plannedQty || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {task.completedQty || "-"}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {task.worker || "-"}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {task.delayReason || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>

            <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">Supervisor Remarks</p>
              <p className="mt-1 text-sm text-foreground">{remarks || "-"}</p>
            </div>

            {record.evidence.length ? (
              <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Photos ({record.evidence.length})
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {record.evidence.map((file) => (
                    <a
                      key={file.id}
                      href={resolveFileUrl(file.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="block h-20 w-20 overflow-hidden rounded-md border border-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolveFileUrl(file.fileUrl)} alt={file.fileName} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
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
