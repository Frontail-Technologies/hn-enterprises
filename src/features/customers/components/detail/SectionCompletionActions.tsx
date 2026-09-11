"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSetSectionCompletion } from "../../queries/useCustomerMutations";
import type { CompletionSectionKey, SectionCompletionResult } from "../../types/customer.types";

const COMPLETION_LABEL: Record<SectionCompletionResult["status"], string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export function SectionCompletionActions({
  customerId,
  sectionKey,
  sectionLabel,
  result,
}: {
  customerId: string;
  sectionKey: CompletionSectionKey;
  sectionLabel: string;
  result?: SectionCompletionResult;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useSetSectionCompletion(customerId, sectionLabel);
  const isDone = result?.status === "DONE";

  return (
    <div className="flex items-center gap-2">
      <SectionStatusBadge result={result} />
      {isDone ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            Reopen
          </Button>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reopen {sectionLabel}?</DialogTitle>
                <DialogDescription>
                  This will mark the section as In Progress. Existing data will be kept.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate(
                      { sectionKey, completed: false },
                      { onSuccess: () => setConfirmOpen(false) },
                    )
                  }
                >
                  Reopen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ sectionKey, completed: true })}
        >
          Mark Complete
        </Button>
      )}
    </div>
  );
}

export function SectionStatusBadge({ result }: { result?: SectionCompletionResult }) {
  if (!result) return null;
  const tone =
    result.status === "DONE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      : result.status === "IN_PROGRESS"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
        : "border-border bg-muted/40 text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}
      title={result.missingRequiredFields.length ? `Missing: ${result.missingRequiredFields.join(", ")}` : undefined}
    >
      {COMPLETION_LABEL[result.status]}
    </span>
  );
}
