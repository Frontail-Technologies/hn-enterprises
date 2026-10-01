"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  entityLabel: string;
  entityLabelPlural?: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  note?: string;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  entityLabel,
  entityLabelPlural,
  isSubmitting,
  onConfirm,
  note,
}: BulkDeleteDialogProps) {
  const plural = entityLabelPlural ?? `${entityLabel}s`;
  const noun = selectedCount === 1 ? entityLabel : plural;

  function handleOpenChange(nextOpen: boolean) {
    // AlertDialogCancel is a Close primitive, so it can't be stopped by `disabled` alone once
    // clicked - but since it's also `disabled` while submitting, the only remaining ways this
    // could fire mid-delete are Escape/outside-click, which this blocks too.
    if (!nextOpen && isSubmitting) return;
    onOpenChange(nextOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {selectedCount} {noun}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes <strong>{selectedCount}</strong> {noun.toLowerCase()} and cannot be undone.
            {note ? ` ${note}` : ""}
            {isSubmitting ? (
              <span className="mt-2 block text-foreground">
                Deleting - this can take a while for records with a lot of linked data. Please don&apos;t close this tab.
              </span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          {/* A plain Button, not AlertDialogAction - AlertDialogAction is built on the Close
              primitive and dismisses the dialog on click regardless of `disabled`, which closed
              this modal instantly on the very first click, before the pending state ever showed. */}
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-1.5 inline-flex" />
                Deleting...
              </>
            ) : (
              `Delete ${selectedCount} ${noun}`
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
