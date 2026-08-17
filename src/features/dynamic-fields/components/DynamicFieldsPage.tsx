"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageShell } from "@/components/shared/PageShell";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useBulkDeleteDynamicFields, useDynamicFieldsQuery } from "../hooks/useDynamicFields";
import type { CustomField } from "../types";
import { DynamicFieldDrawer } from "./DynamicFieldDrawer";
import { DynamicFieldGrid } from "./DynamicFieldGrid";
import { DynamicFieldImport } from "./DynamicFieldImport";

type StatusFilter = "All" | "Active" | "Inactive";

const exportColumns: ExportColumn<CustomField>[] = [
  { label: "Label", getValue: (row) => row.label },
  { label: "Key", getValue: (row) => row.key },
  { label: "Group", getValue: (row) => row.group },
  { label: "Position", getValue: (row) => row.sortOrder },
  { label: "Value Type", getValue: (row) => row.valueType },
  { label: "Options", getValue: (row) => (row.valueType === "Dropdown" ? row.dropdownOptions.join(", ") : "-") },
  { label: "Required", getValue: (row) => (row.required ? "Yes" : "No") },
  { label: "Access", getValue: (row) => row.supervisorAccess },
  { label: "Status", getValue: (row) => row.status },
];

export function DynamicFieldsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Active");
  const [importOpen, setImportOpen] = useState(false);

  const { data: fields = [], isLoading } = useDynamicFieldsQuery(statusFilter === "All" ? undefined : statusFilter);
  const { selectedIds, toggleRow, clear } = useBulkSelection();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteDynamicFields();

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    setDeleteOpen(false);
    clear();
  }

  const filteredFields = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return fields;
    return fields.filter(
      (field) =>
        field.label.toLowerCase().includes(query) ||
        field.key.toLowerCase().includes(query) ||
        field.group.toLowerCase().includes(query),
    );
  }, [fields, search]);

  return (
    <PageShell
      title="Dynamic Fields"
      subtitle="Extra fields shown on the Customer form and the master-sheet import template - grouped, ordered by drag, and versioned with a safe deactivate-before-delete flow."
      actions={
        <>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={() => void exportRowsToExcel("dynamic-fields.xlsx", exportColumns, filteredFields)}
          >
            <DownloadSimpleIcon size={15} />
            Export Excel
          </button>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={() => setImportOpen(true)}
          >
            <UploadSimpleIcon size={15} />
            Import
          </button>
          <DynamicFieldDrawer fields={fields} />
        </>
      }
      contentClassName="space-y-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="max-w-sm flex-1">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search fields..." />
        </div>
        <Select value={statusFilter} onValueChange={(value) => { if (value) setStatusFilter(value as StatusFilter); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="All">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BulkDeleteBar selectedCount={selectedIds.size} onClear={clear} onDelete={() => setDeleteOpen(true)} />
      <DynamicFieldGrid
        fields={filteredFields}
        isLoading={isLoading}
        dragEnabled={!search.trim()}
        selection={{ selectedIds, onToggleRow: toggleRow }}
      />

      <DynamicFieldImport open={importOpen} onOpenChange={setImportOpen} />

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={selectedIds.size}
        entityLabel="Field"
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        note="Only fields that are already Inactive can be permanently deleted, matching the single-field delete flow - active fields in the selection are skipped."
      />
    </PageShell>
  );
}
