import { useState } from "react";
import Link from "next/link";
import { ArrowSquareOutIcon, ArrowUUpLeftIcon, CheckIcon } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useReviewDpr } from "../hooks/usePlanning";
import type { DprRecord, SitePlan } from "../types/planning.types";
import { customerLabel, dprWorkSummary } from "./planning-table.utils";

/**
 * DPRs with admin review: approve submitted ones (one by one or selected
 * together), or send them back to the supervisor with a reason (they become
 * a draft again and the supervisor gets a notification).
 */
export function DprTable({
  rows,
  planByKey,
  projectNameById,
  date,
  showDate = false,
}: {
  rows: DprRecord[];
  planByKey: Map<string, SitePlan>;
  projectNameById: Map<string, string>;
  date: string;
  /** Show a Date column (lists that span several days). */
  showDate?: boolean;
}) {
  const review = useReviewDpr();
  const [selected, setSelected] = useState<string[]>([]);
  const [sendBack, setSendBack] = useState<string[] | null>(null);

  const submittedIds = rows.filter((row) => row.status === "Submitted").map((row) => row.id);
  const chosen = selected.filter((id) => submittedIds.includes(id));
  const allChosen = submittedIds.length > 0 && chosen.length === submittedIds.length;
  const toggle = (id: string) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  async function approve(ids: string[]) {
    await review.mutateAsync({ ids, action: "approve" });
    setSelected((current) => current.filter((id) => !ids.includes(id)));
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
                aria-label="Select all submitted DPRs"
              />
            </TableHead>
            {showDate ? <TableHead className="w-28">Date</TableHead> : null}
            <TableHead>Supervisor</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Customer / BP</TableHead>
            <TableHead>Work Done</TableHead>
            <TableHead className="w-24 text-center">Progress</TableHead>
            <TableHead className="w-44">Status</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead className="w-56">Review</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const summary = dprWorkSummary(row.tasks);
            const completed = row.tasks.filter((task) => task.completedQty.trim()).length;
            const hasMatchingPlan = planByKey.has(`${row.supervisorId}-${row.customerId}`);
            const isSubmitted = row.status === "Submitted";
            return (
              <TableRow key={row.id} className="bg-card hover:bg-muted/25">
                <TableCell>
                  {isSubmitted ? <Checkbox checked={chosen.includes(row.id)} onCheckedChange={() => toggle(row.id)} aria-label="Select DPR" /> : null}
                </TableCell>
                {showDate ? <TableCell className="tabular-nums text-muted-foreground">{row.date}</TableCell> : null}
                <TableCell className="whitespace-normal font-medium text-foreground">{row.supervisorName}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{projectNameById.get(row.projectId) ?? row.projectName ?? "—"}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{row.siteLabel || "—"}</TableCell>
                <TableCell className="whitespace-normal text-foreground">{customerLabel(row.customerName, row.customerTrBpNo)}</TableCell>
                <TableCell className="max-w-[240px] truncate text-muted-foreground" title={summary}>
                  {summary || "—"}
                </TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">
                  {completed}/{row.tasks.length}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={row.status} />
                    {row.status === "Draft" && row.reviewNote ? (
                      <span className="text-xs whitespace-normal text-destructive" title={row.reviewNote}>
                        Sent back: {row.reviewNote}
                      </span>
                    ) : null}
                    {row.status === "Approved" && row.reviewedByName ? (
                      <span className="text-xs text-muted-foreground">by {row.reviewedByName}</span>
                    ) : null}
                    {!hasMatchingPlan && !showDate ? <span className="text-xs text-muted-foreground">No matching plan</span> : null}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground" title={row.remarks}>
                  {row.remarks || "—"}
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
                      href={`/planning/dpr?supervisorId=${row.supervisorId}&customerId=${row.customerId}&date=${showDate ? row.date : date}`}
                      className="inline-flex items-center gap-1 px-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Open <ArrowSquareOutIcon size={12} />
                    </Link>
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
            await review.mutateAsync({ ids: sendBack, action: "reject", note });
            setSelected((current) => current.filter((id) => !sendBack.includes(id)));
            setSendBack(null);
          }}
        />
      ) : null}
    </div>
  );
}

function SendBackDialog({ count, busy, onClose, onConfirm }: { count: number; busy: boolean; onClose: () => void; onConfirm: (note: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send back {count === 1 ? "this DPR" : `${count} DPRs`}?</DialogTitle>
          <DialogDescription>It goes back to draft. The supervisor is notified with your reason, fixes it and submits again.</DialogDescription>
        </DialogHeader>
        <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Reason, e.g. completed quantity doesn't match the photos" className="min-h-24" autoFocus />
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" disabled={!note.trim() || busy} onClick={() => void onConfirm(note.trim())}>
            {busy ? "Sending back..." : "Send back"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
