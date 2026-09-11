"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
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
import { useCreateDynamicField, useDynamicFieldGroupsQuery, useUpdateDynamicField } from "../hooks/useDynamicFields";
import { buildDynamicFieldFormSchema, type DynamicFieldFormValues } from "../schemas/dynamic-field-form.schema";
import type { CustomField, CustomFieldAccess, CustomFieldValueType } from "../types";

const valueTypes: CustomFieldValueType[] = ["Text", "Number", "Date", "Amount", "Yes / No", "Dropdown"];
const statuses: Array<CustomField["status"]> = ["Active", "Inactive"];

function defaultValues(field?: CustomField): DynamicFieldFormValues {
  return field
    ? {
        label: field.label,
        group: field.group,
        valueType: field.valueType,
        dropdownOptions: field.dropdownOptions.map((value) => ({ value })),
        required: field.required,
        supervisorAccess: field.supervisorAccess,
        status: field.status,
      }
    : {
        label: "",
        group: "",
        valueType: "Text",
        dropdownOptions: [],
        required: false,
        supervisorAccess: "Admin Only",
        status: "Active",
      };
}

export function DynamicFieldDialog({
  field,
  fields,
  iconOnly = false,
}: {
  field?: CustomField;
  fields: CustomField[];
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [optionInput, setOptionInput] = useState("");
  const schema = buildDynamicFieldFormSchema();
  const { control, register, handleSubmit, reset, formState } = useForm<DynamicFieldFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues(field),
  });
  const { fields: optionFields, append, remove } = useFieldArray({ control, name: "dropdownOptions" });
  const valueType = useWatch({ control, name: "valueType" });
  const { data: groups = [] } = useDynamicFieldGroupsQuery();
  const createField = useCreateDynamicField();
  const updateField = useUpdateDynamicField(field?.id ?? "");
  const isSaving = createField.isPending || updateField.isPending || formState.isSubmitting;
  const triggerLabel = field ? "Edit" : "Add Field";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      reset(defaultValues(field));
      setOptionInput("");
    }
    setOpen(nextOpen);
  }

  function addOption() {
    const next = optionInput.trim();
    if (!next || optionFields.some((item) => item.value === next)) return;
    append({ value: next });
    setOptionInput("");
  }

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      label: values.label,
      group: values.group,
      valueType: values.valueType,
      dropdownOptions: values.dropdownOptions.map((item) => item.value),
      required: values.required,
      supervisorAccess: values.supervisorAccess,
      status: values.status,
    };
    if (field) {
      await updateField.mutateAsync(payload);
    } else {
      const siblingMax = fields
        .filter((item) => item.group === values.group)
        .reduce((max, item) => Math.max(max, item.sortOrder), -1);
      await createField.mutateAsync({ values: payload, sortOrder: siblingMax + 1 });
    }
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {iconOnly ? (
        <ActionTooltip label={triggerLabel}>
          <DialogTrigger
            render={<Button type="button" variant="ghost" size="icon-sm" aria-label={triggerLabel} />}
          >
            <NotePencilIcon size={15} />
          </DialogTrigger>
        </ActionTooltip>
      ) : (
        <DialogTrigger render={<Button type="button" size="compact" />}>
          <PlusIcon size={13} />
          {triggerLabel}
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>{field ? "Edit Field" : "Add Field"}</DialogTitle>
          <DialogDescription>
            Configure a dynamic field shown on the Customer form and master-sheet import template.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <FormField label="Field Label">
              <Input {...register("label")} />
              {formState.errors.label ? <p className="text-xs text-destructive">{formState.errors.label.message}</p> : null}
            </FormField>
            <FormField label="Group">
              <Input list="dynamic-field-groups" {...register("group")} placeholder="e.g. KYC Details" />
              <datalist id="dynamic-field-groups">
                {groups.map((group) => (
                  <option key={group} value={group} />
                ))}
              </datalist>
              {formState.errors.group ? <p className="text-xs text-destructive">{formState.errors.group.message}</p> : null}
              {!field ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  New fields are added to the end of their group - drag to reposition afterward.
                </p>
              ) : null}
            </FormField>
            <FormField label="Value Type">
              <Controller
                control={control}
                name="valueType"
                render={({ field: controllerField }) => (
                  <Select
                    value={controllerField.value}
                    onValueChange={(value) => { if (value) controllerField.onChange(value); }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {valueTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            {valueType === "Dropdown" ? (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Dropdown Options</span>
                <div className="flex gap-2">
                  <Input
                    value={optionInput}
                    onChange={(event) => setOptionInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addOption();
                      }
                    }}
                    placeholder="Enter option"
                  />
                  <Button type="button" size="icon" onClick={addOption} aria-label="Add option">
                    <PlusIcon size={15} />
                  </Button>
                </div>
                {optionFields.length ? (
                  <div className="flex flex-wrap gap-2">
                    {optionFields.map((optionField, index) => (
                      <span key={optionField.id} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-foreground">
                        {optionField.value}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => remove(index)}
                          aria-label={`Remove ${optionField.value}`}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                {formState.errors.dropdownOptions ? (
                  <p className="text-xs text-destructive">{formState.errors.dropdownOptions.message}</p>
                ) : null}
              </div>
            ) : null}
            <FormField label="Required">
              <Controller
                control={control}
                name="required"
                render={({ field: controllerField }) => (
                  <Select
                    value={controllerField.value ? "Yes" : "No"}
                    onValueChange={(value) => { if (value) controllerField.onChange(value === "Yes"); }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Supervisor Access">
              <Controller
                control={control}
                name="supervisorAccess"
                render={({ field: controllerField }) => (
                  <Select
                    value={controllerField.value}
                    onValueChange={(value) => { if (value) controllerField.onChange(value as CustomFieldAccess); }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin Only">Admin Only</SelectItem>
                      <SelectItem value="Supervisor Can View">Supervisor Can View</SelectItem>
                      <SelectItem value="Supervisor Can View & Edit">Supervisor Can View & Edit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            {field ? (
              <FormField label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field: controllerField }) => (
                    <Select
                      value={controllerField.value}
                      onValueChange={(value) => { if (value) controllerField.onChange(value as CustomField["status"]); }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            ) : null}
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 p-4">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
