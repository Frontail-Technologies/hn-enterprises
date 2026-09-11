"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {selectedCount} {noun}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes <strong>{selectedCount}</strong> {noun.toLowerCase()} and cannot be undone.
            {note ? ` ${note}` : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : `Delete ${selectedCount} ${noun}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
