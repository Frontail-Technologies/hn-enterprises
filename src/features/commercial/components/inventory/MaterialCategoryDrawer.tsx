"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button type="button" variant="outline" />}>
        <PlusIcon size={15} className="mr-1.5" />
        Add Category
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Add Material Category</SheetTitle>
          <SheetDescription>Create a new category for grouping materials.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <Field label="Category Name">
            <Input value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} placeholder="e.g. GI Pipe" />
          </Field>
          <Field label="Description (Optional)">
            <Input value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Category description" />
          </Field>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="border-t border-border/70 pt-4">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="button" onClick={handleSave} disabled={createValue.isPending}>
              {createValue.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
