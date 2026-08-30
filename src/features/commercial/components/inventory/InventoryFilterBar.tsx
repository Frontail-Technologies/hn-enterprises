"use client";

import { FunnelSimpleIcon, XIcon } from "@phosphor-icons/react";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { Button } from "@/components/ui/button";
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
  function set<K extends keyof InventoryFilterState>(key: K, value: InventoryFilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <FunnelSimpleIcon size={14} />
        Filters
      </span>

      <SearchableSelect
        value={filters.projectId || ""}
        onValueChange={(value) => set("projectId", value)}
        placeholder="All Projects"
        className="h-10 w-60"
        options={[
          { value: "", label: "All Projects" },
          { value: "unassigned", label: "Central / Unassigned" },
          ...projects.map((project) => ({ value: project.id, label: project.name })),
        ]}
      />

      <Select value={filters.source || "all"} onValueChange={(value) => set("source", value === "all" ? "" : (value as MaterialSource))}>
        <SelectTrigger className="h-10 w-36">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="purchase">Purchase</SelectItem>
          <SelectItem value="pbg">PBG</SelectItem>
        </SelectContent>
      </Select>

      {showMonthFilter ? (
        <MonthPicker value={filters.month} onChange={(month) => set("month", month)} placeholder="All Time" className="h-10 w-52" />
      ) : null}

      {showPlumberFilter ? (
        <SearchableSelect
          value={filters.plumberId || ""}
          onValueChange={(value) => set("plumberId", value)}
          placeholder="All Plumbers"
          className="h-10 w-55"
          options={[{ value: "", label: "All Plumbers" }, ...plumbers.map((plumber) => ({ value: plumber.id, label: plumber.name }))]}
        />
      ) : null}

      {hasActiveInventoryFilters(filters) ? (
        <Button type="button" variant="ghost" size="sm" className="h-10 gap-1 text-xs" onClick={() => onChange(EMPTY_INVENTORY_FILTERS)}>
          <XIcon size={13} />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
