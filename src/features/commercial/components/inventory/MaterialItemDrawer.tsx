"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/FormField";
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
import { materialItemFormSchema } from "../../schemas/material-item.schema";
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

export function MaterialItemDrawer() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const createMaterial = useCreateMaterial();
  const { data: categories = [] } = useMasterValuesQuery("Material Categories");
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialItemFormSchema),
    defaultValues: emptyValues(),
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const validationMessage = Object.values(formState.errors)[0]?.message as string | undefined;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(emptyValues());
      setSubmitError("");
    }
    setOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      await createMaterial.mutateAsync(values);
      setOpen(false);
    } catch (saveError) {
      setSubmitError(saveError instanceof Error ? saveError.message : "Unable to add material.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" size="compact" />}>
        <PlusIcon size={13} />
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
          <FormField label="Material Name" helper={'Example: GI Pipe 20MM, 1/2" GI Tee, 90MM Coupler.'}>
            <Input {...register("name")} placeholder="Enter material name" />
          </FormField>
          <FormField label="Category" helper="Grouping only. Example: GI Pipe, MDPE Pipe, Valve, Tools.">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={(category) => field.onChange(category ?? "")}>
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
              )}
            />
          </FormField>
          <FormField label="Unit">
            <Controller
              control={control}
              name="unit"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(unit) => field.onChange(unit ?? "Nos")}>
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
              )}
            />
          </FormField>
          <FormField label="Reorder Level">
            <Input type="number" {...register("reorderLevel")} placeholder="0" />
          </FormField>

          {validationMessage || submitError ? (
            <p className="text-xs text-destructive">{validationMessage || submitError}</p>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" onClick={() => void onSubmit()} disabled={createMaterial.isPending}>
            {createMaterial.isPending ? "Saving..." : "Save Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
