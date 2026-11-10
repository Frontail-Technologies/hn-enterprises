"use client";

import type { ListFilter } from "@/components/shared/list";
import { MonthPicker } from "@/components/shared/MonthPicker";

/**
 * Inventory page filters. Project, source and plumber are ListTable filters
 * (keys `projectId`, `source`, `plumberId` in list state); month is a toolbar
 * MonthPicker stored under `month` (yyyy-MM). The API params they produce are
 * unchanged.
 */
export function inventoryFiltersToDateRange(month: string | undefined) {
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

export function inventoryListFilters({
  projects,
  plumbers,
  showPlumberFilter,
}: {
  projects: { id: string; name: string }[];
  plumbers: { id: string; name: string }[];
  showPlumberFilter: boolean;
}): ListFilter[] {
  return [
    {
      id: "projectId",
      label: "Project",
      quick: true,
      options: [
        { value: "unassigned", label: "Central / Unassigned" },
        ...projects.map((project) => ({ value: project.id, label: project.name })),
      ],
    },
    { id: "source", label: "Source", quick: true, options: SOURCE_OPTIONS },
    ...(showPlumberFilter
      ? [{ id: "plumberId", label: "Plumber", quick: true, options: plumbers.map((plumber) => ({ value: plumber.id, label: plumber.name })) }]
      : []),
  ];
}

export function InventoryMonthFilter({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  return <MonthPicker value={value} onChange={onChange} placeholder="All time" className="h-8 w-36 text-[13px]" />;
}
