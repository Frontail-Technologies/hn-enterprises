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
import { cn } from "@/lib/utils";
import type { DeleteImpactAction, DeleteImpactDependency, DeleteImpactResult } from "./delete-impact.types";

const ACTION_META: Record<DeleteImpactAction, { label: string; badgeVariant: "destructive" | "secondary" | "outline" }> = {
  delete: { label: "Will be deleted", badgeVariant: "destructive" },
  detach: { label: "Will be detached", badgeVariant: "secondary" },
  preserve: { label: "Preserved", badgeVariant: "outline" },
  block: { label: "Blocks deletion", badgeVariant: "destructive" },
};

// Above this many affected records, the entity name must be typed to confirm
// (§5) - below it, a normal Cancel/Confirm pair is enough. Deliberately not
// required for every deletion, only ones with real blast radius.
const DEFAULT_HIGH_IMPACT_THRESHOLD = 10;

export type DeleteImpactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rendered as the dialog's own trigger button - omit for a fully external/controlled trigger. */
  trigger?: ReactElement;
  /** e.g. "Project" - used to build "Delete Project & Related Data". */
  entityTypeLabel: string;
  impact: DeleteImpactResult | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  onConfirm: () => Promise<void>;
  isConfirming?: boolean;
  /** Offered instead of a disabled delete button when the entity is blocked and an
   * archive/deactivate path already exists (§8) - omit if none exists. */
  onArchive?: () => Promise<void>;
  isArchiving?: boolean;
  archiveLabel?: string;
  highImpactThreshold?: number;
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
}: DeleteImpactDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  function handleOpenChange(nextOpen: boolean) {
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
  const deleteCtaLabel = impact && impact.totalAffected > 0 ? `Delete ${entityTypeLabel} & Related Data` : `Delete ${entityTypeLabel}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>Delete {entityLabel ? `"${entityLabel}"` : entityTypeLabel}?</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Checking what's linked to this record..."
              : impact?.canDelete === false
                ? `This ${entityTypeLabel.toLowerCase()} cannot be deleted directly.`
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
            <Button type="button" variant="outline" onClick={handleArchive} disabled={isArchiving}>
              {isArchiving ? "Archiving..." : (archiveLabel ?? `Archive ${entityTypeLabel}`)}
            </Button>
          ) : null}
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          {impact?.canDelete ? (
            <Button type="button" variant="destructive" onClick={handleConfirm} disabled={!canConfirm}>
              {isConfirming ? "Deleting..." : deleteCtaLabel}
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
