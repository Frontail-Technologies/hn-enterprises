"use client";

import { useState, type ReactElement } from "react";
import { CaretDownIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import type { DeleteImpactAction, DeleteImpactDependency, DeleteImpactResult } from "./delete-impact.types";

const ACTION_META: Record<DeleteImpactAction, { label: string; badgeVariant: "destructive" | "secondary" | "outline" }> = {
  delete: { label: "Will be deleted", badgeVariant: "destructive" },
  detach: { label: "Will be detached", badgeVariant: "secondary" },
  preserve: { label: "Preserved", badgeVariant: "outline" },
  block: { label: "Blocks deletion", badgeVariant: "destructive" },
};

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
  const deleteCtaLabel =
    confirmLabel ??
    (impact && impact.totalAffected > 0 ? `${action.verb} ${entityTypeLabel} & Related Data` : `${action.verb} ${entityTypeLabel}`);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>{action.verb} {entityLabel ? `"${entityLabel}"` : entityTypeLabel}?</DialogTitle>
          <DialogDescription>
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
              {impact.canDelete && note ? (
                <p className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">{note}</p>
              ) : null}
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
              ) : impact.totalAffected === 0 ? (
                <p className="text-sm text-muted-foreground">No related records will be affected.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">This will also affect:</p>
                  <div className="space-y-1.5">
                    {impact.dependencies.map((dependency) => (
                      <DependencyRow key={dependency.key} dependency={dependency} />
                    ))}
                  </div>
                </div>
              )}

              {isHighImpact ? (
                <div className="space-y-1.5 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <label className="block text-xs font-medium text-foreground">
                    Type <span className="font-semibold">{impact.entity.label}</span> to confirm ({impact.totalAffected} records
                    affected)
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

function DependencyRow({ dependency }: { dependency: DeleteImpactDependency }) {
  const [expanded, setExpanded] = useState(false);
  const meta = ACTION_META[dependency.action];
  const hasPreview = Boolean(dependency.preview?.length);

  return (
    <div className="rounded-md border border-border/70 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{dependency.label}</span>
          <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-sm tabular-nums text-muted-foreground">{dependency.count}</span>
          {hasPreview ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={expanded ? "Hide sample records" : "Show sample records"}
              onClick={() => setExpanded((current) => !current)}
            >
              <CaretDownIcon className={cn("transition-transform", expanded && "rotate-180")} size={13} />
            </Button>
          ) : null}
        </div>
      </div>
      {hasPreview && expanded ? (
        <ul className="mt-1.5 space-y-0.5 border-t border-border/60 pt-1.5 pl-1 text-xs text-muted-foreground">
          {dependency.preview!.map((row) => (
            <li key={row.id} className="truncate">
              {row.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
