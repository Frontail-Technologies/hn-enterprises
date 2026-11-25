"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
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
import { useCreateMaterial, useUpdateMaterial } from "../../hooks/useMaterials";
import { materialItemFormSchema } from "../../schemas/material-item.schema";
import type { Material, MaterialFormValues } from "../../types/material.types";
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

function valuesFrom(material: Material): MaterialFormValues {
  return { name: material.name, category: material.category, unit: material.unit, reorderLevel: String(material.reorderLevel ?? 0) };
}

/** Add a material, or (with `material`) edit its name, category, unit and reorder level. */
export function MaterialItemDrawer({ material, trigger }: { material?: Material; trigger?: ReactNode } = {}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial(material?.id ?? "");
  const saving = createMaterial.isPending || updateMaterial.isPending;
  const { data: categories = [] } = useMasterValuesQuery("Material Categories");
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialItemFormSchema),
    defaultValues: material ? valuesFrom(material) : emptyValues(),
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const validationMessage = Object.values(formState.errors)[0]?.message as string | undefined;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(material ? valuesFrom(material) : emptyValues());
      setSubmitError("");
    }
    setOpen(nextOpen);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      if (material) await updateMaterial.mutateAsync(values);
      else await createMaterial.mutateAsync(values);
      setOpen(false);
    } catch (saveError) {
      setSubmitError(saveError instanceof Error ? saveError.message : "Unable to add material.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ?? (
        <DialogTrigger render={<Button type="button" size="compact" variant={material ? "outline" : "default"} />}>
          {material ? <NotePencilIcon size={13} /> : <PlusIcon size={13} />}
          {material ? "Edit Material" : "Add Material"}
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-3">
          <DialogTitle>{material ? "Edit Material" : "Add Material"}</DialogTitle>
          <DialogDescription>
            {material
              ? "Changes apply everywhere this material appears; past transactions keep their quantities."
              : "Create an actual stock item. Categories only group materials; they are not selectable stock items."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <FormField label="Material Name" required helper={'Example: GI Pipe 20MM, 1/2" GI Tee, 90MM Coupler.'}>
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
          <FormField label="Unit" required>
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

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" onClick={() => void onSubmit()} disabled={saving}>
            {saving ? "Saving..." : "Save Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
