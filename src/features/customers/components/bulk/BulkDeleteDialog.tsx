"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

const CONFIRM_WORD = "DELETE";

// A bulk delete removes many customers in one action, so it gets a stronger
// confirmation than the existing single-customer DeleteConfirmDialog
// (click-to-confirm) - a typed confirmation. This is a hard delete matching
// the existing single-customer delete policy - the codebase has no
// soft-delete concept for customers, so none was invented here.
export function BulkDeleteDialog({ open, onOpenChange, selectedCount, isSubmitting, onConfirm }: BulkDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setConfirmText("");
  }

  const canConfirm = confirmText.trim().toUpperCase() === CONFIRM_WORD;

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

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground" htmlFor="bulk-delete-confirm">
            Type <strong>DELETE</strong> to confirm
          </label>
          <Input
            id="bulk-delete-confirm"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="DELETE"
            autoFocus
          />
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
            Cancel
          </DialogClose>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={!canConfirm || isSubmitting}>
            {isSubmitting ? "Deleting..." : `Delete ${selectedCount} Customer${selectedCount === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
