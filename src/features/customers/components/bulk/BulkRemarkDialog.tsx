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
import { Textarea } from "@/components/ui/textarea";

interface BulkRemarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  isSubmitting: boolean;
  onSubmit: (note: string) => void;
}

// customerNotes is an append-only history (confirmed via audit: no update
// path exists), so this always ADDS a new note row per selected customer -
// there's no "overwrite" mode because nothing in the existing remarks system
// supports overwriting.
export function BulkRemarkDialog({ open, onOpenChange, selectedCount, isSubmitting, onSubmit }: BulkRemarkDialogProps) {
  const [note, setNote] = useState("");
  // Reset the draft note whenever the dialog transitions to open, following
  // React's "adjust state during render" pattern instead of an effect (a
  // synchronous setState-in-effect would trigger an avoidable extra render).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setNote("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add Remark to {selectedCount} Customer{selectedCount === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>
            This adds a new remark to every selected customer&apos;s note history - it does not
            replace any existing remark.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Type a remark to add to all selected customers..."
          rows={4}
          autoFocus
        />

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
            Cancel
          </DialogClose>
          <Button type="button" onClick={() => onSubmit(note.trim())} disabled={!note.trim() || isSubmitting}>
            {isSubmitting ? "Saving..." : `Add Remark to ${selectedCount} Customer${selectedCount === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
