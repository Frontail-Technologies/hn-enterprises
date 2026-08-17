"use client";

import { useState, type ReactNode } from "react";
import { PlusIcon } from "@phosphor-icons/react";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateMaterial } from "../../hooks/useMaterials";
import type { MaterialFormValues } from "../../types/material.types";
import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";

const unitOptions = ["Meter", "Nos", "Roll", "Set", "Kg", "Litre"];

function emptyValues(): MaterialFormValues {
  return {
    name: "",
    category: "",
    unit: "Nos",
    reorderLevel: "0",
  };
}

function Field({ label, children, helper }: { label: string; children: ReactNode; helper?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {helper ? <span className="block text-[11px] text-muted-foreground">{helper}</span> : null}
    </label>
  );
}

export function MaterialItemDrawer() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<MaterialFormValues>(emptyValues());
  const [error, setError] = useState("");
  const createMaterial = useCreateMaterial();
  const { data: categories = [] } = useMasterValuesQuery("Material Categories");

  function set<K extends keyof MaterialFormValues>(key: K, value: MaterialFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(emptyValues());
      setError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!values.name.trim()) {
      setError("Material name is required.");
      return;
    }
    if (!values.unit.trim()) {
      setError("Unit is required.");
      return;
    }

    setError("");
    try {
      await createMaterial.mutateAsync(values);
      setOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to add material.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon size={15} />
        Add Material
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>Add Material</DialogTitle>
          <DialogDescription>
            Create an actual stock item. Categories only group materials; they are not selectable stock items.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <Field label="Material Name" helper={'Example: GI Pipe 20MM, 1/2" GI Tee, 90MM Coupler.'}>
            <Input
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              placeholder="Enter material name"
            />
          </Field>
          <Field label="Category" helper="Grouping only. Example: GI Pipe, MDPE Pipe, Valve, Tools.">
            <Select value={values.category || ""} onValueChange={(category) => set("category", category ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.value}>
                    {cat.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Unit">
            <Select value={values.unit} onValueChange={(unit) => set("unit", unit ?? "Nos")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Reorder Level">
            <Input
              type="number"
              value={values.reorderLevel}
              onChange={(event) => set("reorderLevel", event.target.value)}
              placeholder="0"
            />
          </Field>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" onClick={handleSave} disabled={createMaterial.isPending}>
            {createMaterial.isPending ? "Saving..." : "Save Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
