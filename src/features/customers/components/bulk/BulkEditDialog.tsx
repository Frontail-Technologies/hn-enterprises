"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/shared/FormField";
import { useProjectSitesQuery } from "@/features/projects/hooks/useProjects";
import { useBulkFieldOptions } from "../../hooks/useBulkFieldOptions";
import {
  BULK_FIELD_LABELS,
  bulkFieldDisplayValue,
  bulkFieldToChange,
} from "../../utils/bulk-field-format";
import type { CustomerBulkChanges, CustomerBulkFieldKey } from "../../types/customer-bulk.types";
import { BulkFieldControl } from "./BulkFieldControl";

const EDITABLE_FIELDS: CustomerBulkFieldKey[] = [
  "supervisorId",
  "plumberId",
  "projectId",
  "siteId",
  "scheme",
  "connectionType",
  "houseType",
  "status",
  "paymentStatus",
  "paymentMode",
  "initialAmount",
  "jmrDone",
  "jmrSubmittedInPbg",
  "giBillDone",
  "gcBillDone",
  "conversionBillDone",
];

function emptyRecord<T>(fill: T): Record<CustomerBulkFieldKey, T> {
  return EDITABLE_FIELDS.reduce(
    (acc, key) => {
      acc[key] = fill;
      return acc;
    },
    {} as Record<CustomerBulkFieldKey, T>,
  );
}

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  isSubmitting: boolean;
  onSubmit: (changes: CustomerBulkChanges, changeSummary: string[]) => void;
}

// The general multi-field editor (§ Bulk Edit Is For Multi-Field Changes).
// Every field renders collapsed to just its checkbox+label until checked -
// the control only appears once the user opts into changing that field, so
// the dialog stays short instead of showing 16 disabled dropdowns at once.
export function BulkEditDialog({ open, onOpenChange, selectedCount, isSubmitting, onSubmit }: BulkEditDialogProps) {
  const fieldOptions = useBulkFieldOptions();
  const [checked, setChecked] = useState<Record<CustomerBulkFieldKey, boolean>>(() => emptyRecord(false));
  const [values, setValues] = useState<Record<CustomerBulkFieldKey, string>>(() => emptyRecord(""));

  // Reset on open via React's "adjust state during render" pattern (see
  // BulkRemarkDialog/BulkDeleteDialog) rather than an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setChecked(emptyRecord(false));
      setValues(emptyRecord(""));
    }
  }

  // Shared with BulkFieldControl's own siteId lookup - same query key, so
  // react-query dedups this into a single cached fetch, not two.
  const { data: sites = [] } = useProjectSitesQuery(checked.projectId ? values.projectId : "");

  function toggle(field: CustomerBulkFieldKey) {
    setChecked((current) => ({ ...current, [field]: !current[field] }));
    setValues((current) => ({
      ...current,
      [field]: "",
      ...(field === "projectId" ? { siteId: "" } : {}),
    }));
  }

  function setValue(field: CustomerBulkFieldKey, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
      // Changing the project invalidates whatever site was already picked.
      ...(field === "projectId" ? { siteId: "" } : {}),
    }));
  }

  const changeEntries: { field: CustomerBulkFieldKey; label: string; display: string }[] = [];
  const changes: CustomerBulkChanges = {};
  for (const field of EDITABLE_FIELDS) {
    // Site shares the "Project / Site" group's single checkbox rather than
    // having its own - it's enabled whenever that group is checked.
    const isEnabled = field === "siteId" ? checked.projectId : checked[field];
    if (!isEnabled) continue;
    const fragment = bulkFieldToChange(field, values[field]);
    if (!fragment) continue;
    Object.assign(changes, fragment);
    const siteName = field === "siteId" ? sites.find((site) => site.id === values.siteId)?.name : undefined;
    changeEntries.push({
      field,
      label: BULK_FIELD_LABELS[field],
      display: bulkFieldDisplayValue(field, values[field], fieldOptions, siteName),
    });
  }

  function handleSubmit() {
    onSubmit(
      changes,
      changeEntries.map((entry) => `${entry.label} → ${entry.display}`),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Bulk Edit {selectedCount} Customer{selectedCount === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>Choose fields to update. Unchecked fields remain unchanged.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          <BulkEditSection title="Assignment">
            <BulkFieldRow label="Supervisor" checked={checked.supervisorId} onToggle={() => toggle("supervisorId")}>
              <BulkFieldControl
                field="supervisorId"
                value={values.supervisorId}
                onChange={(value) => setValue("supervisorId", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow label="Plumber" checked={checked.plumberId} onToggle={() => toggle("plumberId")}>
              <BulkFieldControl
                field="plumberId"
                value={values.plumberId}
                onChange={(value) => setValue("plumberId", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow label="Project / Site" checked={checked.projectId} onToggle={() => toggle("projectId")}>
              <div className="space-y-3">
                <FormField label="Project">
                  <BulkFieldControl
                    field="projectId"
                    value={values.projectId}
                    onChange={(value) => setValue("projectId", value)}
                    fieldOptions={fieldOptions}
                  />
                </FormField>
                <FormField label="Site / Area">
                  <BulkFieldControl
                    field="siteId"
                    value={values.siteId}
                    onChange={(value) => setValue("siteId", value)}
                    fieldOptions={fieldOptions}
                    relatedProjectId={values.projectId}
                  />
                </FormField>
              </div>
            </BulkFieldRow>
          </BulkEditSection>

          <BulkEditSection title="Customer">
            <BulkFieldRow label="Scheme" checked={checked.scheme} onToggle={() => toggle("scheme")}>
              <BulkFieldControl
                field="scheme"
                value={values.scheme}
                onChange={(value) => setValue("scheme", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow
              label="Connection Type"
              checked={checked.connectionType}
              onToggle={() => toggle("connectionType")}
            >
              <BulkFieldControl
                field="connectionType"
                value={values.connectionType}
                onChange={(value) => setValue("connectionType", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow label="House Type" checked={checked.houseType} onToggle={() => toggle("houseType")}>
              <BulkFieldControl
                field="houseType"
                value={values.houseType}
                onChange={(value) => setValue("houseType", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow label="Customer Status" checked={checked.status} onToggle={() => toggle("status")}>
              <BulkFieldControl
                field="status"
                value={values.status}
                onChange={(value) => setValue("status", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
          </BulkEditSection>

          <BulkEditSection title="Payment">
            <BulkFieldRow
              label="Payment Status"
              checked={checked.paymentStatus}
              onToggle={() => toggle("paymentStatus")}
            >
              <BulkFieldControl
                field="paymentStatus"
                value={values.paymentStatus}
                onChange={(value) => setValue("paymentStatus", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow label="Payment Mode" checked={checked.paymentMode} onToggle={() => toggle("paymentMode")}>
              <BulkFieldControl
                field="paymentMode"
                value={values.paymentMode}
                onChange={(value) => setValue("paymentMode", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow
              label="Initial Amount"
              checked={checked.initialAmount}
              onToggle={() => toggle("initialAmount")}
            >
              <BulkFieldControl
                field="initialAmount"
                value={values.initialAmount}
                onChange={(value) => setValue("initialAmount", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
          </BulkEditSection>

          <BulkEditSection title="Completion">
            <BulkFieldRow label="JMR Done" checked={checked.jmrDone} onToggle={() => toggle("jmrDone")}>
              <BulkFieldControl
                field="jmrDone"
                value={values.jmrDone}
                onChange={(value) => setValue("jmrDone", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow
              label="JMR Submitted in PBG"
              checked={checked.jmrSubmittedInPbg}
              onToggle={() => toggle("jmrSubmittedInPbg")}
            >
              <BulkFieldControl
                field="jmrSubmittedInPbg"
                value={values.jmrSubmittedInPbg}
                onChange={(value) => setValue("jmrSubmittedInPbg", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow label="GI Bill Done" checked={checked.giBillDone} onToggle={() => toggle("giBillDone")}>
              <BulkFieldControl
                field="giBillDone"
                value={values.giBillDone}
                onChange={(value) => setValue("giBillDone", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow label="GC Bill Done" checked={checked.gcBillDone} onToggle={() => toggle("gcBillDone")}>
              <BulkFieldControl
                field="gcBillDone"
                value={values.gcBillDone}
                onChange={(value) => setValue("gcBillDone", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
            <BulkFieldRow
              label="Conversion Bill Done"
              checked={checked.conversionBillDone}
              onToggle={() => toggle("conversionBillDone")}
            >
              <BulkFieldControl
                field="conversionBillDone"
                value={values.conversionBillDone}
                onChange={(value) => setValue("conversionBillDone", value)}
                fieldOptions={fieldOptions}
              />
            </BulkFieldRow>
          </BulkEditSection>
        </div>

        {changeEntries.length > 0 && (
          <div className="shrink-0 space-y-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground">Changes</p>
            <ul className="space-y-0.5">
              {changeEntries.map((entry) => (
                <li key={entry.field} className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">{entry.label}</span>
                  <span className="font-medium text-foreground">→ {entry.display}</span>
                </li>
              ))}
            </ul>
            <p className="pt-0.5 text-[11px] text-muted-foreground">
              {selectedCount} customer{selectedCount === 1 ? "" : "s"} will be updated.
            </p>
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
            Cancel
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={changeEntries.length === 0 || isSubmitting}>
            {isSubmitting ? "Updating..." : `Update ${selectedCount} Customer${selectedCount === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkEditSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function BulkFieldRow({
  label,
  checked,
  onToggle,
  children,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
        <Checkbox checked={checked} onCheckedChange={onToggle} aria-label={`Change ${label}`} />
        {label}
      </label>
      {checked && <div className="pl-6">{children}</div>}
    </div>
  );
}
