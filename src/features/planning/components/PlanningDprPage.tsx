"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { FilePdfIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { resolveFileUrl } from "@/lib/upload";
import { DprGeneratedPreview } from "./DprGeneratedPreview";
import { useDeleteDpr, useDprRecordsQuery, useUpdateDpr } from "../hooks/usePlanning";
import type { DprRecord, DprTask } from "../types/planning.types";
import { PageLoading } from "@/components/shared/PageLoading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EditableStatus = "draft" | "submitted";
type DprDraft = { tasks: DprTask[]; remarks: string; status: EditableStatus };
type EditableField = "plannedQty" | "completedQty" | "worker" | "delayReason";

const STATUS_LABEL: Record<EditableStatus, string> = { draft: "Draft", submitted: "Submitted" };

/** The record's status as the server spells it ("approved" only on old DPRs). */
function backendStatus(status: DprRecord["status"]) {
  return status === "Draft" ? "draft" : status === "Submitted" ? "submitted" : "approved";
}

export function PlanningDprPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") ?? "";
  const supervisorId = searchParams.get("supervisorId") ?? "";
  const date = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

  const { data: dprRecords = [], isLoading } = useDprRecordsQuery({ customerId, supervisorId, date });
  const record = dprRecords[0];
  const [previewOpen, setPreviewOpen] = useState(false);
  const updateDpr = useUpdateDpr();
  const deleteDpr = useDeleteDpr();
  const [draft, setDraft] = useState<DprDraft | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const editing = draft !== null;

  const savedTasks = useMemo(() => record?.tasks ?? [], [record]);
  const tasks = draft?.tasks ?? savedTasks;
  const remarks = draft?.remarks ?? record?.remarks ?? "";
  const siteLabel = record?.siteLabel || "Unknown site";
  const supervisorName = record?.supervisorName || "Unknown supervisor";
  const customerName = record?.customerName || "Unknown customer";

  const totalCompleted = useMemo(
    () => tasks.reduce((sum, item) => sum + (Number(item.completedQty) || 0), 0),
    [tasks],
  );

  function startEdit() {
    if (!record) return;
    setDraft({ tasks: savedTasks, remarks: record.remarks, status: record.status === "Draft" ? "draft" : "submitted" });
  }

  function setTask(id: DprTask["id"], key: EditableField, value: string) {
    setDraft((current) =>
      current
        ? {
            ...current,
            tasks: current.tasks.map((task) =>
              task.id === id ? { ...task, [key]: value, ...(key === "worker" ? { plumberId: undefined } : {}) } : task,
            ),
          }
        : current,
    );
  }

  function save() {
    if (!record || !draft) return;
    // The server replaces the task list, so send only the filled-in tasks.
    const payload = draft.tasks
      .map((task) => ({
        id: task.id,
        plannedQty: task.plannedQty.trim(),
        completedQty: task.completedQty.trim(),
        worker: task.worker.trim(),
        plumberId: task.plumberId,
        delayReason: task.delayReason.trim(),
      }))
      .filter((task) => task.plannedQty || task.completedQty || task.worker || task.delayReason);
    // Send the status only when it changed (an old "approved" DPR keeps it otherwise).
    const statusChanged = backendStatus(record.status) !== draft.status;
    updateDpr.mutate(
      { id: record.id, input: { tasks: payload, remarks: draft.remarks.trim(), ...(statusChanged ? { status: draft.status } : {}) } },
      { onSuccess: () => setDraft(null) },
    );
  }

  const cell = (task: DprTask, key: EditableField, label: string, className?: string) =>
    editing ? (
      <Input
        value={task[key]}
        onChange={(event) => setTask(task.id, key, event.target.value)}
        aria-label={`${task.label} ${label}`}
        inputMode={key === "plannedQty" || key === "completedQty" ? "decimal" : undefined}
        className={cn("h-8", className)}
      />
    ) : (
      task[key] || "-"
    );

  return (
    <PageShell
      title="DPR"
      actions={
        editing ? (
          <div className="grid grid-cols-2 gap-2 sm:contents">
            <Button type="button" variant="outline" disabled={updateDpr.isPending} onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={updateDpr.isPending} onClick={save}>
              {updateDpr.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <div className={cn("grid gap-2 sm:contents", record ? "grid-cols-2" : "grid-cols-1")}>
            <Link
              href={`/planning/plan?supervisorId=${supervisorId}&customerId=${customerId}&date=${date}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Open Planning
            </Link>
            {record ? (
              <>
                <Button type="button" variant="outline" onClick={startEdit}>
                  <PencilSimpleIcon size={15} />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <TrashIcon size={15} />
                  Delete
                </Button>
                <Button type="button" onClick={() => setPreviewOpen(true)}>
                  <FilePdfIcon size={15} />
                  Generate DPR
                </Button>
              </>
            ) : null}
          </div>
        )
      }
    >
      <div className="space-y-3">
        {isLoading ? (
          <PageLoading className="min-h-24 rounded-card border border-border bg-card shadow-card" />
        ) : (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-card border border-border bg-card shadow-card px-3 py-2">
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
            {record ? (
              <div>
                <p className="mb-0.5 text-xs font-medium text-muted-foreground">Status</p>
                {draft ? (
                  <Select
                    value={draft.status}
                    onValueChange={(value) => {
                      if (value === "draft" || value === "submitted") setDraft({ ...draft, status: value });
                    }}
                  >
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue>{STATUS_LABEL[draft.status]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABEL) as EditableStatus[]).map((value) => (
                        <SelectItem key={value} value={value}>
                          {STATUS_LABEL[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={record.status} />
                )}
              </div>
            ) : null}
          </div>
        )}

        {isLoading ? null : !record ? (
          <p className="rounded-card border border-border bg-card shadow-card px-3 py-4 text-sm text-muted-foreground">
            No DPR filed for this site and date yet.
          </p>
        ) : (
          <>
            <section className="rounded-card border border-border bg-card shadow-card">
              <div className="border-b border-border/70 px-3 py-2">
                <h2 className="text-sm font-semibold text-foreground">DPR Work Items</h2>
                <p className="text-xs text-muted-foreground">
                  {editing ? "Edit the work done, then save." : "Compact entry view for selected supervisor and site."}
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
                      <TableCell className="text-center">{cell(task, "plannedQty", "planned qty", "text-center")}</TableCell>
                      <TableCell className="text-center">{cell(task, "completedQty", "completed qty", "text-center")}</TableCell>
                      <TableCell className="whitespace-normal">{cell(task, "worker", "plumber / labour")}</TableCell>
                      <TableCell className="whitespace-normal">{cell(task, "delayReason", "delay reason")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>

            <div className="rounded-card border border-border bg-card shadow-card px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">Supervisor Remarks</p>
              {draft ? (
                <Textarea
                  value={draft.remarks}
                  onChange={(event) => setDraft({ ...draft, remarks: event.target.value })}
                  aria-label="Remarks"
                  className="mt-1 min-h-20"
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">{remarks || "-"}</p>
              )}
            </div>

            {record.evidence.length ? (
              <div className="rounded-card border border-border bg-card shadow-card px-3 py-2">
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

      <DeleteConfirmDialog
        itemName="this DPR"
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        isConfirming={deleteDpr.isPending}
        description="It moves to the recycle bin and can be restored for 30 days."
        onConfirm={() => {
          if (!record) return;
          deleteDpr.mutate(record.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              router.push("/planning");
            },
          });
        }}
      />
    </PageShell>
  );
}
