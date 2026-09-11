"use client";

import { FilterDialog } from "@/components/shared/FilterDialog";
import { MonthPicker } from "@/components/shared/MonthPicker";
import type { MaterialSource } from "../../types/material.types";

export type InventoryFilterState = {
  projectId: string;
  source: MaterialSource | "";
  month: string;
  plumberId: string;
};

export const EMPTY_INVENTORY_FILTERS: InventoryFilterState = {
  projectId: "",
  source: "",
  month: "",
  plumberId: "",
};

export function hasActiveInventoryFilters(filters: InventoryFilterState) {
  return Boolean(filters.projectId || filters.source || filters.month || filters.plumberId);
}

export function inventoryFiltersToDateRange(month: string) {
  if (!month) return { from: undefined, to: undefined };
  const [year, monthNum] = month.split("-").map(Number);
  if (!year || !monthNum) return { from: undefined, to: undefined };
  const from = new Date(Date.UTC(year, monthNum - 1, 1)).toISOString().slice(0, 10);
  const to = new Date(Date.UTC(year, monthNum, 0)).toISOString().slice(0, 10);
  return { from, to };
}

const SOURCE_OPTIONS = [
  { value: "purchase", label: "Purchase" },
  { value: "pbg", label: "PBG" },
];

export function InventoryFilterBar({
  filters,
  onChange,
  projects,
  plumbers,
  showPlumberFilter,
  showMonthFilter = true,
}: {
  filters: InventoryFilterState;
  onChange: (filters: InventoryFilterState) => void;
  projects: { id: string; name: string }[];
  plumbers: { id: string; name: string }[];
  showPlumberFilter: boolean;
  showMonthFilter?: boolean;
}) {
  const values: Record<string, string> = {
    projectId: filters.projectId || "all",
    source: filters.source || "all",
    plumberId: filters.plumberId || "all",
    month: filters.month,
  };

  function handleChange(key: string, value: string) {
    const nextValue = value === "all" ? "" : value;
    if (key === "projectId") onChange({ ...filters, projectId: nextValue });
    if (key === "source") onChange({ ...filters, source: nextValue as MaterialSource | "" });
    if (key === "plumberId") onChange({ ...filters, plumberId: nextValue });
    if (key === "month") onChange({ ...filters, month: nextValue });
  }

  return (
    <FilterDialog
      title="Inventory Filters"
      filters={[
        {
          key: "projectId",
          placeholder: "All Projects",
          searchable: true,
          options: [
            { value: "unassigned", label: "Central / Unassigned" },
            ...projects.map((project) => ({ value: project.id, label: project.name })),
          ],
        },
        { key: "source", placeholder: "All Sources", options: SOURCE_OPTIONS },
        ...(showPlumberFilter
          ? [
              {
                key: "plumberId",
                placeholder: "All Plumbers",
                searchable: true,
                options: plumbers.map((plumber) => ({ value: plumber.id, label: plumber.name })),
              },
            ]
          : []),
      ]}
      values={values}
      onChange={handleChange}
      onReset={() => onChange(EMPTY_INVENTORY_FILTERS)}
      renderExtra={
        showMonthFilter
          ? ({ values: draftValues, onChange: updateDraft }) => (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Month</p>
                <MonthPicker
                  value={draftValues.month ?? ""}
                  onChange={(month) => updateDraft("month", month)}
                  placeholder="All Time"
                  className="h-8 w-full text-sm"
                />
              </div>
            )
          : undefined
      }
    />
  );
}
