"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FormField } from "@/components/shared/FormField";
import { DrawerTrigger } from "./DrawerTrigger";
import { useCreateMasterValue, useUpdateMasterValue } from "../../hooks/useMasters";
import type {
  MasterValue,
  MasterValueCategory,
  MasterValueFormValues,
  MasterValueStatus,
} from "../../types/masters.types";

const statuses: MasterValueStatus[] = ["Active", "Inactive"];

export function MasterValueDrawer({
  category,
  value,
  iconOnly = false,
}: {
  category: MasterValueCategory;
  value?: MasterValue;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MasterValueFormValues>(
    value ? { value: value.value, description: value.description, status: value.status } : { value: "", description: "", status: "Active" },
  );
  const [error, setError] = useState("");
  const createValue = useCreateMasterValue(category);
  const updateValue = useUpdateMasterValue(category, value?.id ?? "");
  const isSaving = createValue.isPending || updateValue.isPending;
  const label = value ? "Edit" : "Add Value";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(value ? { value: value.value, description: value.description, status: value.status } : { value: "", description: "", status: "Active" });
      setError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!draft.value.trim()) {
      setError("Value is required");
      return;
    }
    setError("");
    try {
      if (value) await updateValue.mutateAsync(draft);
      else await createValue.mutateAsync(draft);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger label={label} iconOnly={iconOnly} />
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{value ? `Edit ${category}` : `Add ${category}`}</SheetTitle>
          <SheetDescription>Create or update {category.toLowerCase()} options.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <FormField label="Value">
            <Input value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} />
          </FormField>
          <FormField label="Description">
            <Input value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
          </FormField>
          <FormField label="Status">
            <Select value={draft.status} onValueChange={(status) => { if (status) setDraft((current) => ({ ...current, status: status as MasterValueStatus })); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
