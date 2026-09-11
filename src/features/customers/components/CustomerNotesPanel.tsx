"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionCard } from "@/components/shared/SectionCard";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCustomerNoteMutation, useCustomerNotesQuery } from "../queries/useCustomerNotes";
import { formatDateTime } from "../utils/format";

/**
 * Compact notes list + add-note dialog, shared between Customer Detail and
 * Customer Edit (§5-8 of the notes-visibility brief). Notes are independent
 * records (their own GET/POST endpoints) - this never touches the
 * CustomerForm's draft state or "Save Changes" payload.
 */
export function CustomerNotesPanel({ customerId }: { customerId: string }) {
  const { data: notes = [], isLoading } = useCustomerNotesQuery(customerId);
  const [open, setOpen] = useState(false);

  return (
    <SectionCard
      title="Notes"
      action={
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <PlusIcon size={14} />
          Add Note
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <p className="whitespace-pre-wrap text-sm text-foreground">{note.note}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {note.authorName ?? "Unknown"} · {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <AddNoteDialog customerId={customerId} open={open} onOpenChange={setOpen} />
    </SectionCard>
  );
}

function AddNoteDialog({
  customerId,
  open,
  onOpenChange,
}: {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [text, setText] = useState("");
  const createNote = useCreateCustomerNoteMutation(customerId);
  const trimmed = text.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setText("");
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>Add a note to this customer&apos;s record.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          placeholder="Write a note..."
        />
        {createNote.isError ? (
          <p className="text-sm text-destructive">
            {createNote.error instanceof Error ? createNote.error.message : "Unable to save note"}
          </p>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!trimmed || createNote.isPending}
            onClick={() =>
              createNote.mutate(trimmed, {
                onSuccess: () => {
                  setText("");
                  onOpenChange(false);
                },
              })
            }
          >
            {createNote.isPending ? "Saving..." : "Add Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
