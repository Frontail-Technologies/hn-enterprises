"use client";

import { useState, type ReactElement } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { DeleteImpactResult } from "./delete-impact.types";

const DEFAULT_HIGH_IMPACT_THRESHOLD = 10;

/**
 * Two genuinely different actions can share this dialog's impact-preview
 * mechanics: a real permanent delete, or (e.g. staff -> linked login) an
 * action that only deactivates the underlying record. Defaults to "Delete"
 * so every existing consumer is unaffected; pass "Deactivate" only where the
 * confirmed action truly does not remove the row.
 */
const ACTION_COPY: Record<"Delete" | "Deactivate", { verb: string; ing: string; ed: string }> = {
  Delete: { verb: "Delete", ing: "Deleting", ed: "deleted" },
  Deactivate: { verb: "Deactivate", ing: "Deactivating", ed: "deactivated" },
};

export type DeleteImpactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactElement;
  entityTypeLabel: string;
  impact: DeleteImpactResult | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  onConfirm: () => Promise<void>;
  isConfirming?: boolean;
  onArchive?: () => Promise<void>;
  isArchiving?: boolean;
  archiveLabel?: string;
  highImpactThreshold?: number;
  /** Optional reassurance/consequence note shown above the dependency list when the entity can be deleted (e.g. "Historical records will be preserved"). */
  note?: ReactElement | string;
  /** "Delete" (default) for a real permanent delete, "Deactivate" when the confirmed action only deactivates the underlying record. */
  actionLabel?: "Delete" | "Deactivate";
  /** Overrides the auto-generated confirm button text (e.g. "Delete Permanently") when the default "Delete {entityTypeLabel}[& Related Data]" phrasing isn't right for this entity. */
  confirmLabel?: string;
  /** Extra content under the impact summary (e.g. "also delete" options). */
  children?: React.ReactNode;
};

export function DeleteImpactDialog({
  open,
  onOpenChange,
  trigger,
  entityTypeLabel,
  impact,
  isLoading,
  isError,
  onRetry,
  onConfirm,
  isConfirming = false,
  onArchive,
  isArchiving = false,
  archiveLabel,
  highImpactThreshold = DEFAULT_HIGH_IMPACT_THRESHOLD,
  note,
  actionLabel = "Delete",
  confirmLabel,
  children,
}: DeleteImpactDialogProps) {
  const action = ACTION_COPY[actionLabel];
  const [confirmText, setConfirmText] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    // Ignore any close attempt (Escape, outside click, Cancel) while the delete/archive
    // request is in flight - otherwise the dialog can vanish well before the request
    // actually finishes, with the row only updating/disappearing a moment later once it does.
    if (!nextOpen && (isConfirming || isArchiving)) return;
    if (nextOpen) setConfirmText("");
    onOpenChange(nextOpen);
  }

  const isHighImpact = Boolean(impact && impact.canDelete && impact.totalAffected >= highImpactThreshold);
  const confirmTextMatches = !isHighImpact || confirmText.trim() === impact?.entity.label;
  const canConfirm = Boolean(impact?.canDelete) && confirmTextMatches && !isConfirming;

  async function handleConfirm() {
    if (!canConfirm) return;
    await onConfirm();
  }

  async function handleArchive() {
    if (!onArchive) return;
    await onArchive();
  }

  const entityLabel = impact?.entity.label;
  const deleteCtaLabel = confirmLabel ?? action.verb;
  // Only what is removed together with the record, as short tags ("3 notes").
  const removedWithIt = impact?.dependencies.filter((dependency) => dependency.action === "delete" && dependency.count > 0) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>{action.verb} {entityLabel ? `"${entityLabel}"` : entityTypeLabel}?</DialogTitle>
          {/* Kept for screen readers only: no visible sub-label under the title. */}
          <DialogDescription className="sr-only">
            {isLoading
              ? "Checking what's linked to this record..."
              : impact?.canDelete === false
                ? `This ${entityTypeLabel.toLowerCase()} cannot be ${action.ed} directly.`
                : "Review what this will affect before confirming."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <WarningCircleIcon />
              <AlertTitle>Unable to check related records</AlertTitle>
              <AlertDescription>
                <div className="flex items-center justify-between gap-2">
                  <span>Something went wrong loading the delete preview.</span>
                  {onRetry ? (
                    <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                      Retry
                    </Button>
                  ) : null}
                </div>
              </AlertDescription>
            </Alert>
          ) : impact ? (
            <>
              {impact.canDelete && note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
              {impact.blockers.length > 0 ? (
                <Alert variant="destructive">
                  <WarningCircleIcon />
                  <AlertTitle>Cannot be deleted</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-4">
                      {impact.blockers.map((blocker) => (
                        <li key={blocker.key}>{blocker.reason}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : removedWithIt.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {removedWithIt.map((dependency) => (
                    <span key={dependency.key} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                      {dependency.count} {dependency.label.toLowerCase()}
                    </span>
                  ))}
                </div>
              ) : null}

              {children}

              {isHighImpact ? (
                <div className="space-y-1.5 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <label className="block text-xs font-medium text-foreground">
                    Type <span className="font-semibold">{impact.entity.label}</span> to confirm
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(event) => setConfirmText(event.target.value)}
                    placeholder={impact.entity.label}
                    autoComplete="off"
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 flex-row justify-end rounded-b-xl border-t bg-muted/50 p-4">
          {impact && impact.blockers.length > 0 && onArchive ? (
            <Button type="button" variant="outline" onClick={handleArchive} disabled={isArchiving || isConfirming}>
              {isArchiving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-1.5 inline-flex" />
                  Archiving...
                </>
              ) : (
                archiveLabel ?? `Archive ${entityTypeLabel}`
              )}
            </Button>
          ) : null}
          <DialogClose render={<Button type="button" variant="outline" disabled={isConfirming || isArchiving} />}>Cancel</DialogClose>
          {impact?.canDelete ? (
            <Button type="button" variant="destructive" onClick={handleConfirm} disabled={!canConfirm}>
              {isConfirming ? (
                <>
                  <LoadingSpinner size="sm" className="mr-1.5 inline-flex" />
                  {action.ing}...
                </>
              ) : (
                deleteCtaLabel
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
