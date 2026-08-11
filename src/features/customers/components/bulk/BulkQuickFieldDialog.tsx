"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { BULK_FIELD_LABELS, bulkFieldDisplayValue, bulkFieldToChange } from "../../utils/bulk-field-format";
import type { BulkQuickAction } from "../../utils/bulk-quick-actions";
import type { CustomerBulkChanges } from "../../types/customer-bulk.types";
import { BulkFieldControl } from "./BulkFieldControl";

interface BulkQuickFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: BulkQuickAction | null;
  selectedCount: number;
  isSubmitting: boolean;
  onSubmit: (changes: CustomerBulkChanges, changeSummary: string[]) => void;
}

// The compact single-purpose dialog behind every Assign▾/Update▾ menu item
// (§ Assign Menu / § Update Menu) - one field (or the Project+Site pair),
// no field-selection checkboxes needed since there's nothing else to
// choose. Still builds its payload through the same bulkFieldToChange
// helper and submits through the same bulk update mutation as the general
// BulkEditDialog - no separate backend logic.
export function BulkQuickFieldDialog({
  open,
  onOpenChange,
  action,
  selectedCount,
  isSubmitting,
  onSubmit,
}: BulkQuickFieldDialogProps) {
  const fieldOptions = useBulkFieldOptions();
  const [value, setValue] = useState("");
  const [siteValue, setSiteValue] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValue("");
      setSiteValue("");
    }
  }

  const { data: sites = [] } = useProjectSitesQuery(action?.field === "projectSite" ? value : "");

  if (!action) return null;

  const changes: CustomerBulkChanges = {};
  const changeSummary: string[] = [];

  if (action.field === "projectSite") {
    const projectFragment = bulkFieldToChange("projectId", value);
    if (projectFragment) {
      Object.assign(changes, projectFragment);
      changeSummary.push(`${BULK_FIELD_LABELS.projectId} → ${bulkFieldDisplayValue("projectId", value, fieldOptions)}`);
    }
    const siteFragment = bulkFieldToChange("siteId", siteValue);
    if (siteFragment) {
      Object.assign(changes, siteFragment);
      const siteName = sites.find((site) => site.id === siteValue)?.name;
      changeSummary.push(
        `${BULK_FIELD_LABELS.siteId} → ${bulkFieldDisplayValue("siteId", siteValue, fieldOptions, siteName)}`,
      );
    }
  } else {
    const field = action.field;
    const fragment = bulkFieldToChange(field, value);
    if (fragment) {
      Object.assign(changes, fragment);
      changeSummary.push(`${BULK_FIELD_LABELS[field]} → ${bulkFieldDisplayValue(field, value, fieldOptions)}`);
    }
  }

  const canSubmit = Object.keys(changes).length > 0;

  function handleSubmit() {
    onSubmit(changes, changeSummary);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{action.title}</DialogTitle>
          <DialogDescription>
            {selectedCount} customer{selectedCount === 1 ? "" : "s"} selected
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {action.field === "projectSite" ? (
            <>
              <FormField label="Project">
                <BulkFieldControl field="projectId" value={value} onChange={setValue} fieldOptions={fieldOptions} />
              </FormField>
              <FormField label="Site / Area">
                <BulkFieldControl
                  field="siteId"
                  value={siteValue}
                  onChange={setSiteValue}
                  fieldOptions={fieldOptions}
                  relatedProjectId={value}
                />
              </FormField>
            </>
          ) : (
            <FormField label={BULK_FIELD_LABELS[action.field]}>
              <BulkFieldControl field={action.field} value={value} onChange={setValue} fieldOptions={fieldOptions} />
            </FormField>
          )}
          {action.note && <p className="text-xs text-muted-foreground">{action.note}</p>}
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
            Cancel
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving..." : action.actionLabel(selectedCount)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
