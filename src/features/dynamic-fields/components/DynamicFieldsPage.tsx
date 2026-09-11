"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, MagnifyingGlassIcon, SlidersHorizontalIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterDialog } from "@/components/shared/FilterDialog";
import { PageShell } from "@/components/shared/PageShell";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useBulkDeleteDynamicFields, useDynamicFieldsQuery } from "../hooks/useDynamicFields";
import type { CustomField } from "../types";
import { DynamicFieldDialog } from "./DynamicFieldDialog";
import { DynamicFieldGrid } from "./DynamicFieldGrid";

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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Active");

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
      icon={SlidersHorizontalIcon}
      actions={
        <>
          <div className="relative min-w-0 sm:w-52">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search fields..."
              className="h-8 w-full max-w-full pl-8 sm:w-52"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:contents">
            <FilterDialog
              title="Dynamic Field Filters"
              values={{ status: statusFilter === "All" ? "all" : statusFilter }}
              filters={[
                {
                  key: "status",
                  placeholder: "All Statuses",
                  options: [
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ],
                },
              ]}
              onChange={(_key, value) => setStatusFilter(value === "all" ? "All" : (value as StatusFilter))}
              onReset={() => setStatusFilter("Active")}
            />

            <Button type="button" variant="outline" size="compact" onClick={() => void exportRowsToExcel("dynamic-fields.xlsx", exportColumns, filteredFields)}>
              <DownloadSimpleIcon size={12} />
              Export
            </Button>

            <Button type="button" variant="outline" size="compact" onClick={() => router.push("/dynamic-fields/import")}>
              <UploadSimpleIcon size={12} />
              Import
            </Button>
          </div>

          <DynamicFieldDialog fields={fields} />
        </>
      }
      contentClassName="space-y-4"
    >
      <BulkDeleteBar selectedCount={selectedIds.size} onClear={clear} onDelete={() => setDeleteOpen(true)} />
      <DynamicFieldGrid
        fields={filteredFields}
        isLoading={isLoading}
        dragEnabled={!search.trim()}
        selection={{ selectedIds, onToggleRow: toggleRow }}
      />

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
