"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

// Generic version of Customers' BulkDeleteDialog - a plain Cancel/Delete
// click-to-confirm, parameterized by entity label so every bulk-delete list
// in the app shares one implementation instead of seven near-identical copies.
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Delete {selectedCount} {noun}?
          </DialogTitle>
          <DialogDescription>
            This permanently deletes <strong>{selectedCount}</strong> {noun.toLowerCase()} and cannot be undone.
            {note ? ` ${note}` : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>Cancel</DialogClose>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : `Delete ${selectedCount} ${noun}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
