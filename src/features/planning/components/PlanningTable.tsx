import { useState } from "react";
import Link from "next/link";
import { ArrowSquareOutIcon, ArrowUUpLeftIcon, CheckIcon, TrashIcon } from "@phosphor-icons/react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeletePlan, useReviewPlans } from "../hooks/usePlanning";
import { DPR_DONE_STATUSES, planningKey } from "../model/planning-entry.rules";
import type { DprRecord, SitePlan } from "../types/planning.types";
import { PlanStatus, SendBackDialog } from "./PlanReview";
import { customerLabel, taskSummary } from "./planning-table.utils";

/**
 * Site plans with admin review: approve submitted plans (one by one or
 * selected together), send them back with a reason, or delete one.
 */
export function PlanningTable({
  rows,
  dprByKey,
  projectNameById,
  date,
  showDate = false,
}: {
  rows: SitePlan[];
  /** DPRs keyed by planningKey (with the date when showDate is on). */
  dprByKey: Map<string, DprRecord>;
  projectNameById: Map<string, string>;
  /** The day shown (ignored when showDate is on - each row uses its own date). */
  date?: string;
  /** Show a Date column (lists that span several days). */
  showDate?: boolean;
}) {
  const review = useReviewPlans();
  const deletePlan = useDeletePlan();
  const [selected, setSelected] = useState<string[]>([]);
  const [sendBack, setSendBack] = useState<string[] | null>(null);
  const [toDelete, setToDelete] = useState<SitePlan | null>(null);

  const submittedIds = rows.filter((row) => row.status === "Submitted").map((row) => row.id);
  const chosen = selected.filter((id) => submittedIds.includes(id));
  const allChosen = submittedIds.length > 0 && chosen.length === submittedIds.length;
  const toggle = (id: string) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const unselect = (ids: string[]) => setSelected((current) => current.filter((id) => !ids.includes(id)));

  async function approve(ids: string[]) {
    try {
      await review.mutateAsync({ ids, action: "approve" });
      unselect(ids);
    } catch {
      // The hook shows the error.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {chosen.length ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium">{chosen.length} selected</span>
          <Button type="button" size="compact" disabled={review.isPending} onClick={() => void approve(chosen)}>
            <CheckIcon size={13} />
            Approve
          </Button>
          <Button type="button" size="compact" variant="outline" disabled={review.isPending} onClick={() => setSendBack(chosen)}>
            <ArrowUUpLeftIcon size={13} />
            Send back
          </Button>
          <Button type="button" size="compact" variant="ghost" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      ) : null}

      <Table className="min-w-[1180px]">
        <TableHeader>
          <TableRow className="bg-table-header/85 text-xs font-semibold text-muted-foreground">
            <TableHead className="w-10">
              <Checkbox
                checked={allChosen}
                disabled={!submittedIds.length}
                onCheckedChange={() => setSelected(allChosen ? [] : submittedIds)}
                aria-label="Select all submitted plans"
              />
            </TableHead>
            {showDate ? <TableHead className="w-28">Date</TableHead> : null}
            <TableHead>Supervisor</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Customer / BP</TableHead>
            <TableHead>Planned Work</TableHead>
            <TableHead className="w-44">Status</TableHead>
            <TableHead className="w-28">DPR</TableHead>
            <TableHead className="w-64">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const summary = taskSummary(row.tasks);
            const rowDate = showDate || !date ? row.date : date;
            const matchedDpr = dprByKey.get(planningKey(row, showDate));
            const done = matchedDpr && DPR_DONE_STATUSES.has(matchedDpr.status);
            const isSubmitted = row.status === "Submitted";
            return (
              <TableRow key={row.id} className="bg-card hover:bg-muted/25">
                <TableCell>
                  {isSubmitted ? <Checkbox checked={chosen.includes(row.id)} onCheckedChange={() => toggle(row.id)} aria-label="Select plan" /> : null}
                </TableCell>
                {showDate ? <TableCell className="tabular-nums text-muted-foreground">{row.date}</TableCell> : null}
                <TableCell className="whitespace-normal font-medium text-foreground">{row.supervisorName}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{projectNameById.get(row.projectId) || row.projectName || "—"}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{row.siteLabel || "—"}</TableCell>
                <TableCell className="whitespace-normal text-foreground">{customerLabel(row.customerName, row.customerTrBpNo)}</TableCell>
                <TableCell className="max-w-[260px] truncate text-muted-foreground" title={summary}>
                  {summary || "—"}
                </TableCell>
                <TableCell>
                  <PlanStatus plan={row} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={done ? "Completed" : matchedDpr ? "In Progress" : "Pending"} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {isSubmitted ? (
                      <>
                        <Button type="button" size="sm" variant="ghost" className="gap-1 text-success" disabled={review.isPending} onClick={() => void approve([row.id])}>
                          <CheckIcon size={14} />
                          Approve
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="gap-1 text-destructive" disabled={review.isPending} onClick={() => setSendBack([row.id])}>
                          <ArrowUUpLeftIcon size={14} />
                          Send back
                        </Button>
                      </>
                    ) : null}
                    <Link
                      href={`/planning/plan?supervisorId=${row.supervisorId}&customerId=${row.customerId}&date=${rowDate}`}
                      className="inline-flex items-center gap-1 px-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Open <ArrowSquareOutIcon size={12} />
                    </Link>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Delete plan"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setToDelete(row)}
                    >
                      <TrashIcon size={13} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {sendBack ? (
        <SendBackDialog
          count={sendBack.length}
          busy={review.isPending}
          onClose={() => setSendBack(null)}
          onConfirm={async (note) => {
            try {
              await review.mutateAsync({ ids: sendBack, action: "reject", note });
              unselect(sendBack);
              setSendBack(null);
            } catch {
              // The hook shows the error.
            }
          }}
        />
      ) : null}

      <DeleteConfirmDialog
        itemName={toDelete ? `plan of ${toDelete.customerName || "this customer"} (${toDelete.date})` : "plan"}
        isOpen={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        isConfirming={deletePlan.isPending}
        description="It moves to the recycle bin and can be restored for 30 days."
        onConfirm={() => {
          if (!toDelete) return;
          deletePlan.mutate(toDelete.id, {
            onSuccess: () => {
              unselect([toDelete.id]);
              setToDelete(null);
            },
          });
        }}
      />
    </div>
  );
}
