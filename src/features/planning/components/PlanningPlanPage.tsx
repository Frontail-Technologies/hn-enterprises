"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowUUpLeftIcon, CheckIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { PageShell } from "@/components/shared/PageShell";
import { useDeletePlan, useReviewPlans, useSitePlansQuery, useUpdatePlan } from "../hooks/usePlanning";
import { planningTaskTemplates } from "../services/planning.service";
import type { PlanTask } from "../types/planning.types";
import { PageLoading } from "@/components/shared/PageLoading";
import { PlanStatus, SendBackDialog } from "./PlanReview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PlanningPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") ?? "";
  const supervisorId = searchParams.get("supervisorId") ?? "";
  const date = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

  const { data: sitePlans = [], isLoading } = useSitePlansQuery({ customerId, supervisorId, date });
  const plan = sitePlans[0];
  const tasks = useMemo(() => plan?.tasks ?? planningTaskTemplates.map((template) => ({ ...template, qty: "", worker: "" })), [plan]);
  const siteLabel = plan?.siteLabel || "Unknown site";
  const supervisorName = plan?.supervisorName || "Unknown supervisor";
  const customerName = plan?.customerName || "Unknown customer";

  const review = useReviewPlans();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const [draft, setDraft] = useState<PlanTask[] | null>(null);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const editing = draft !== null;

  const shownTasks = draft ?? tasks;
  const totalQty = useMemo(() => shownTasks.reduce((sum, task) => sum + (Number(task.qty) || 0), 0), [shownTasks]);

  function setTask(id: PlanTask["id"], patch: Partial<Pick<PlanTask, "qty" | "worker">>) {
    setDraft((current) => (current ?? tasks).map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }

  function save() {
    if (!plan || !draft) return;
    // The server replaces the task list, so send only the filled-in tasks.
    const payload = draft
      .map((task) => ({ id: task.id, qty: task.qty.trim(), worker: task.worker.trim() }))
      .filter((task) => task.qty || task.worker);
    updatePlan.mutate({ id: plan.id, input: { tasks: payload } }, { onSuccess: () => setDraft(null) });
  }

  return (
    <PageShell
      title="Planning"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {plan && editing ? (
            <>
              <Button type="button" variant="outline" disabled={updatePlan.isPending} onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button type="button" disabled={updatePlan.isPending} onClick={save}>
                {updatePlan.isPending ? "Saving..." : "Save"}
              </Button>
            </>
          ) : plan ? (
            <>
              {plan.status === "Submitted" ? (
                <>
                  <Button type="button" disabled={review.isPending} onClick={() => review.mutate({ ids: [plan.id], action: "approve" })}>
                    <CheckIcon size={15} />
                    Approve
                  </Button>
                  <Button type="button" variant="outline" disabled={review.isPending} onClick={() => setSendBackOpen(true)}>
                    <ArrowUUpLeftIcon size={15} />
                    Send back
                  </Button>
                </>
              ) : null}
              <Button type="button" variant="outline" onClick={() => setDraft(tasks)}>
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
            </>
          ) : null}
          {!editing ? (
            <Link
              href={`/planning/dpr?supervisorId=${supervisorId}&customerId=${customerId}&date=${date}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Open DPR
            </Link>
          ) : null}
        </div>
      }
    >
      <div className="space-y-2">
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
            <p className="text-xs font-medium text-muted-foreground">Plan Date</p>
            <p className="text-sm font-semibold text-foreground">{date}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Planned Qty</p>
            <p className="text-sm font-semibold text-primary">{totalQty}</p>
          </div>
          {plan ? (
            <div>
              <p className="mb-0.5 text-xs font-medium text-muted-foreground">Status</p>
              <PlanStatus plan={plan} />
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <PageLoading className="min-h-24 rounded-card border border-border bg-card shadow-card" />
        ) : !plan ? (
          <p className="rounded-card border border-border bg-card shadow-card px-3 py-4 text-sm text-muted-foreground">
            No plan filed for this site and date yet.
          </p>
        ) : (
          <PlanningTaskTable siteLabel={siteLabel} tasks={shownTasks} editing={editing} onChange={setTask} />
        )}
      </div>

      {plan && sendBackOpen ? (
        <SendBackDialog
          count={1}
          busy={review.isPending}
          onClose={() => setSendBackOpen(false)}
          onConfirm={async (note) => {
            try {
              await review.mutateAsync({ ids: [plan.id], action: "reject", note });
              setSendBackOpen(false);
            } catch {
              // The hook shows the error.
            }
          }}
        />
      ) : null}

      <DeleteConfirmDialog
        itemName="this plan"
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        isConfirming={deletePlan.isPending}
        description="It moves to the recycle bin and can be restored for 30 days."
        onConfirm={() => {
          if (!plan) return;
          deletePlan.mutate(plan.id, {
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

function PlanningTaskTable({
  siteLabel,
  tasks,
  editing,
  onChange,
}: {
  siteLabel: string;
  tasks: PlanTask[];
  editing: boolean;
  onChange: (id: PlanTask["id"], patch: Partial<Pick<PlanTask, "qty" | "worker">>) => void;
}) {
  return (
    <section className="rounded-card border border-border bg-card shadow-card">
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
              <TableCell className="text-center">
                {editing ? (
                  <Input
                    value={task.qty}
                    onChange={(event) => onChange(task.id, { qty: event.target.value })}
                    inputMode="decimal"
                    aria-label={`${task.label} qty`}
                    className="h-8 text-center"
                  />
                ) : (
                  task.qty || "-"
                )}
              </TableCell>
              <TableCell className="whitespace-normal">
                {editing ? (
                  <Input
                    value={task.worker}
                    onChange={(event) => onChange(task.id, { worker: event.target.value })}
                    aria-label={`${task.label} plumber / labour`}
                    className="h-8"
                  />
                ) : (
                  task.worker || "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
