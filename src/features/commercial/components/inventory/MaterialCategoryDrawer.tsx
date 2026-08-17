"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useCreateMasterValue } from "@/features/management/hooks/useMasters";
import type { MasterValueFormValues } from "@/features/management/types/masters.types";

function Field({ label, children, helper }: { label: string; children: React.ReactNode; helper?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {helper ? <span className="block text-[11px] text-muted-foreground">{helper}</span> : null}
    </label>
  );
}

export function MaterialCategoryDrawer() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MasterValueFormValues>({ value: "", description: "", status: "Active" });
  const [error, setError] = useState("");
  const createValue = useCreateMasterValue("Material Categories");

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft({ value: "", description: "", status: "Active" });
      setError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!draft.value.trim()) {
      setError("Category Name is required");
      return;
    }
    setError("");
    try {
      await createValue.mutateAsync(draft);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <PlusIcon size={15} className="mr-1.5" />
        Add Category
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>Add Material Category</DialogTitle>
          <DialogDescription>Create a new category for grouping materials.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <Field label="Category Name">
            <Input value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} placeholder="e.g. GI Pipe" />
          </Field>
          <Field label="Description (Optional)">
            <Input value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Category description" />
          </Field>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={createValue.isPending}>
            {createValue.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
