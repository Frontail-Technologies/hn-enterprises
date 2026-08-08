"use client";

import { useState, type ReactNode } from "react";
import { NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button, buttonVariants } from "@/components/ui/button";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateDynamicField, useDynamicFieldGroupsQuery, useUpdateDynamicField } from "../hooks/useDynamicFields";
import type { CustomField, CustomFieldAccess, CustomFieldFormValues, CustomFieldValueType } from "../types";

const valueTypes: CustomFieldValueType[] = ["Text", "Number", "Date", "Amount", "Yes / No", "Dropdown"];
const statuses: Array<CustomField["status"]> = ["Active", "Inactive"];

function emptyDraft(field?: CustomField): CustomFieldFormValues {
  return field
    ? {
        label: field.label,
        group: field.group,
        valueType: field.valueType,
        dropdownOptions: field.dropdownOptions,
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function DynamicFieldDrawer({
  field,
  fields,
  iconOnly = false,
}: {
  field?: CustomField;
  /** Full current field list, used to auto-append a new field to the end of its group. */
  fields: CustomField[];
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CustomFieldFormValues>(emptyDraft(field));
  const [optionInput, setOptionInput] = useState("");
  const [error, setError] = useState("");
  const { data: groups = [] } = useDynamicFieldGroupsQuery();
  const createField = useCreateDynamicField();
  const updateField = useUpdateDynamicField(field?.id ?? "");
  const isSaving = createField.isPending || updateField.isPending;
  const triggerLabel = field ? "Edit" : "Add Field";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(emptyDraft(field));
      setOptionInput("");
      setError("");
    }
    setOpen(nextOpen);
  }

  function addOption() {
    const next = optionInput.trim();
    if (!next || draft.dropdownOptions.includes(next)) return;
    setDraft((current) => ({ ...current, dropdownOptions: [...current.dropdownOptions, next] }));
    setOptionInput("");
  }

  async function handleSave() {
    if (!draft.label.trim() || !draft.group.trim()) {
      setError("Label and group are required");
      return;
    }
    if (draft.valueType === "Dropdown" && !draft.dropdownOptions.length) {
      setError("Add at least one dropdown option");
      return;
    }
    setError("");
    try {
      if (field) {
        await updateField.mutateAsync(draft);
      } else {
        const siblingMax = fields
          .filter((item) => item.group === draft.group)
          .reduce((max, item) => Math.max(max, item.sortOrder), -1);
        await createField.mutateAsync({ values: draft, sortOrder: siblingMax + 1 });
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {iconOnly ? (
        <ActionTooltip label={triggerLabel}>
          <SheetTrigger
            render={<button type="button" className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label={triggerLabel} />}
          >
            <NotePencilIcon size={15} />
          </SheetTrigger>
        </ActionTooltip>
      ) : (
        <SheetTrigger render={<Button type="button" />}>
          <PlusIcon size={15} />
          {triggerLabel}
        </SheetTrigger>
      )}
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{field ? "Edit Field" : "Add Field"}</SheetTitle>
          <SheetDescription>
            Configure a dynamic field shown on the Customer form and master-sheet import template.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <Field label="Field Label">
            <Input value={draft.label} onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))} />
          </Field>
          <Field label="Group">
            <Input
              list="dynamic-field-groups"
              value={draft.group}
              onChange={(event) => setDraft((current) => ({ ...current, group: event.target.value }))}
              placeholder="e.g. KYC Details"
            />
            <datalist id="dynamic-field-groups">
              {groups.map((group) => (
                <option key={group} value={group} />
              ))}
            </datalist>
            {!field ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                New fields are added to the end of their group - drag to reposition afterward.
              </p>
            ) : null}
          </Field>
          <Field label="Value Type">
            <Select
              value={draft.valueType}
              onValueChange={(valueType) => {
                if (valueType) setDraft((current) => ({ ...current, valueType: valueType as CustomFieldValueType }));
              }}
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
          </Field>
          {draft.valueType === "Dropdown" ? (
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
              {draft.dropdownOptions.length ? (
                <div className="flex flex-wrap gap-2">
                  {draft.dropdownOptions.map((option) => (
                    <span key={option} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-foreground">
                      {option}
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDraft((current) => ({ ...current, dropdownOptions: current.dropdownOptions.filter((item) => item !== option) }))}
                        aria-label={`Remove ${option}`}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <Field label="Required">
            <Select
              value={draft.required ? "Yes" : "No"}
              onValueChange={(value) => {
                if (value) setDraft((current) => ({ ...current, required: value === "Yes" }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Supervisor Access">
            <Select
              value={draft.supervisorAccess}
              onValueChange={(access) => {
                if (access) setDraft((current) => ({ ...current, supervisorAccess: access as CustomFieldAccess }));
              }}
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
          </Field>
          {field ? (
            <Field label="Status">
              <Select
                value={draft.status}
                onValueChange={(status) => {
                  if (status) setDraft((current) => ({ ...current, status: status as CustomField["status"] }));
                }}
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
            </Field>
          ) : null}
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
