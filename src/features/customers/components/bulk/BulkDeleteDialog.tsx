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
  isSubmitting: boolean;
  onConfirm: () => void;
}

// A plain Cancel/Delete click-to-confirm, matching the single-customer
// DeleteConfirmDialog. This is a hard delete matching the existing
// single-customer delete policy - the codebase has no soft-delete concept
// for customers, so none was invented here.
export function BulkDeleteDialog({ open, onOpenChange, selectedCount, isSubmitting, onConfirm }: BulkDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Delete {selectedCount} Customer{selectedCount === 1 ? "" : "s"}?
          </DialogTitle>
          <DialogDescription>
            This permanently deletes <strong>{selectedCount}</strong> customer
            {selectedCount === 1 ? "" : "s"} and cannot be undone. Customers with associated
            records (e.g. bills or payments) will be skipped with an error instead of partially
            deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
            Cancel
          </DialogClose>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : `Delete ${selectedCount} Customer${selectedCount === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
