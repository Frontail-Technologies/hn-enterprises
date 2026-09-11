"use client";

import type { ReactElement } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DeleteImpactDialog } from "@/components/shared/DeleteImpactDialog";
import type { DeleteImpactResult } from "@/components/shared/delete-impact.types";

export function DeleteImpactAction({
  open,
  onOpenChange,
  itemName,
  entityTypeLabel,
  impact,
  isImpactLoading,
  isImpactError,
  onRetryImpact,
  onDelete,
  isDeleting,
  onDeactivate,
  isDeactivating,
  deactivateLabel,
  triggerSize = "icon-xs",
  triggerClassName = "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
  iconSize = 13,
  iconClassName,
  note,
  actionLabel = "Delete",
  confirmLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  entityTypeLabel: string;
  impact: DeleteImpactResult | undefined;
  isImpactLoading: boolean;
  isImpactError: boolean;
  onRetryImpact: () => void;
  onDelete: () => Promise<unknown>;
  isDeleting: boolean;
  onDeactivate?: () => Promise<unknown>;
  isDeactivating?: boolean;
  deactivateLabel?: string;
  triggerSize?: "icon-xs" | "icon-sm";
  triggerClassName?: string;
  iconSize?: number;
  iconClassName?: string;
  note?: ReactElement | string;
  /** "Delete" (default) for a real permanent delete, "Deactivate" when the confirmed action only deactivates the underlying record - see DeleteImpactDialog. */
  actionLabel?: "Delete" | "Deactivate";
  /** Overrides the auto-generated confirm button text (e.g. "Delete Permanently") - see DeleteImpactDialog. */
  confirmLabel?: string;
}) {
  return (
    <DeleteImpactDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size={triggerSize}
          aria-label={`${actionLabel} ${itemName}`}
          className={triggerClassName}
        >
          <TrashIcon size={iconSize} className={iconClassName} />
        </Button>
      }
      entityTypeLabel={entityTypeLabel}
      impact={impact}
      isLoading={isImpactLoading}
      isError={isImpactError}
      onRetry={onRetryImpact}
      isConfirming={isDeleting}
      note={note}
      actionLabel={actionLabel}
      confirmLabel={confirmLabel}
      onConfirm={async () => {
        await onDelete();
        onOpenChange(false);
      }}
      isArchiving={isDeactivating}
      archiveLabel={deactivateLabel}
      onArchive={
        onDeactivate
          ? async () => {
              await onDeactivate();
              onOpenChange(false);
            }
          : undefined
      }
    />
  );
}
