import { useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { SitePlan } from "../types/planning.types";

/** The plan's review status, with the send-back reason or who approved it. */
export function PlanStatus({ plan }: { plan: Pick<SitePlan, "status" | "reviewNote" | "reviewedByName"> }) {
  return (
    <div className="flex flex-col gap-1">
      <StatusBadge status={plan.status === "Sent back" ? "Sent Back" : plan.status} />
      {plan.status === "Sent back" && plan.reviewNote ? (
        <span className="text-xs whitespace-normal text-destructive" title={plan.reviewNote}>
          Sent back: {plan.reviewNote}
        </span>
      ) : null}
      {plan.status === "Approved" && plan.reviewedByName ? <span className="text-xs text-muted-foreground">by {plan.reviewedByName}</span> : null}
    </div>
  );
}

/** Asks for the reason (required) before sending plans back to the supervisor. */
export function SendBackDialog({
  count,
  busy,
  onClose,
  onConfirm,
}: {
  count: number;
  busy: boolean;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send back {count === 1 ? "this plan" : `${count} plans`}?</DialogTitle>
          <DialogDescription>The supervisor is notified with your reason, fixes the plan and submits again.</DialogDescription>
        </DialogHeader>
        <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Reason, e.g. quantity too high for one day" className="min-h-24" autoFocus />
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
