"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowSquareOutIcon, DownloadSimpleIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/shared/DatePicker";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useDprRecordsQuery, useSitePlansQuery } from "../hooks/usePlanning";
import type { PlanningEntryRow } from "../types/planning.types";

const exportColumns: ExportColumn<PlanningEntryRow>[] = [
  { label: "Supervisor", getValue: (row) => row.supervisorName },
  { label: "Area / Site", getValue: (row) => row.siteArea },
  { label: "Plan Filed", getValue: (row) => (row.planFiled ? "Yes" : "No") },
  { label: "DPR Status", getValue: (row) => row.dprStatus },
];

type FilterKey = "supervisorName" | "siteArea" | "planFiled" | "dprStatus";

type ActiveFilters = Partial<Record<FilterKey, string[]>>;

const columns: Array<{ key: FilterKey; label: string; width: string }> = [
  { key: "supervisorName", label: "Supervisor", width: "w-56" },
  { key: "siteArea", label: "Area / Site", width: "w-56" },
  { key: "planFiled", label: "Plan Filed", width: "w-32" },
  { key: "dprStatus", label: "DPR Status", width: "w-36" },
];

export function PlanningEntryPage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [filters, setFilters] = useState<ActiveFilters>({});

  const { data: sitePlans = [] } = useSitePlansQuery({ date });
  const { data: dprRecords = [] } = useDprRecordsQuery({ date });

  const rows = useMemo(() => {
    const map = new Map<string, PlanningEntryRow>();

    sitePlans.forEach((plan) => {
      map.set(`${plan.supervisorId}-${plan.siteId}`, {
        supervisorId: plan.supervisorId,
        supervisorName: plan.supervisorName,
        projectId: plan.projectId,
        siteId: plan.siteId,
        siteArea: plan.siteLabel,
        planFiled: true,
        dprStatus: "Not Filed",
      });
    });

    dprRecords.forEach((record) => {
      const key = `${record.supervisorId}-${record.siteId}`;
      const existing = map.get(key);
      if (existing) {
        existing.dprStatus = record.status;
      } else {
        map.set(key, {
          supervisorId: record.supervisorId,
          supervisorName: record.supervisorName,
          projectId: record.projectId,
          siteId: record.siteId,
          siteArea: record.siteLabel,
          planFiled: false,
          dprStatus: record.status,
        });
      }
    });

    return Array.from(map.values());
  }, [sitePlans, dprRecords]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.every((column) => {
        const selected = filters[column.key] ?? [];
        if (!selected.length) return true;
        return selected.includes(String(row[column.key]));
      }),
    );
  }, [rows, filters]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, PlanningEntryRow[]>();
    filteredRows.forEach((row) => {
      const current = groups.get(row.supervisorId) ?? [];
      current.push(row);
      groups.set(row.supervisorId, current);
    });
    return Array.from(groups.values());
  }, [filteredRows]);

  return (
    <PageShell
      title="DPR / Planning"
      actions={
        <button
          type="button"
          className={buttonVariants({ variant: "outline", size: "default" })}
          onClick={() => void exportRowsToExcel("dpr-planning.xlsx", exportColumns, filteredRows)}
        >
          <DownloadSimpleIcon size={15} />
          Export Excel
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 lg:flex-row lg:items-end">
          <div className="w-full lg:w-56">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Date</p>
            <DatePicker value={date} onChange={setDate} />
          </div>
        </div>

        <section className="overflow-hidden rounded-lg border border-border/70 bg-card">
          <div className="border-b border-border/70 px-3 py-2">
            <h2 className="text-sm font-semibold text-foreground">Supervisor Wise Work</h2>
            <p className="text-xs text-muted-foreground">
              Showing plans and DPRs actually filed for the selected date. Use column filters to narrow the sheet.
            </p>
          </div>
          {!rows.length ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">
              Nothing filed for this date yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/85 text-xs font-semibold text-muted-foreground">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={cn(
                          "border border-border/60 px-3 py-2 text-left",
                          column.width,
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{column.label}</span>
                          <ColumnFilter
                            columnKey={column.key}
                            label={column.label}
                            rows={rows}
                            selected={filters[column.key] ?? []}
                            onApply={(values) =>
                              setFilters((current) => ({
                                ...current,
                                [column.key]: values,
                              }))
                            }
                          />
                        </div>
                      </th>
                    ))}
                    <th className="w-40 border border-border/60 px-3 py-2 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRows.map((group) =>
                    group.map((row, index) => (
                      <tr key={`${row.supervisorId}-${row.siteId}`} className="bg-card hover:bg-muted/25">
                        {index === 0 ? (
                          <td
                            className="border border-border/55 px-3 py-2 align-top font-semibold text-foreground"
                            rowSpan={group.length}
                          >
                            {row.supervisorName}
                            <div className="mt-1 text-xs font-normal text-muted-foreground">
                              {group.length} site{group.length > 1 ? "s" : ""}
                            </div>
                          </td>
                        ) : null}
                        <td className="border border-border/55 px-3 py-2">{row.siteArea}</td>
                        <td className="border border-border/55 px-3 py-2">
                          <StatusBadge status={row.planFiled ? "Completed" : "Pending"} />
                        </td>
                        <td className="border border-border/55 px-3 py-2">
                          <StatusBadge status={row.dprStatus} />
                        </td>
                        <td className="border border-border/55 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/planning/plan?supervisorId=${row.supervisorId}&siteId=${row.siteId}&date=${date}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              Planning <ArrowSquareOutIcon size={13} />
                            </Link>
                            <Link
                              href={`/planning/dpr?supervisorId=${row.supervisorId}&siteId=${row.siteId}&date=${date}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              DPR <ArrowSquareOutIcon size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function ColumnFilter({
  columnKey,
  label,
  rows,
  selected,
  onApply,
}: {
  columnKey: FilterKey;
  label: string;
  rows: PlanningEntryRow[];
  selected: string[];
  onApply: (values: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);
  const active = selected.length > 0;

  const values = useMemo(() => {
    return Array.from(new Set(rows.map((row) => String(row[columnKey]))))
      .filter((value) => value.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  }, [columnKey, rows, search]);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Filter ${label}`}
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded border border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
              active && "border-primary/30 bg-primary/10 text-primary",
            )}
          >
            <FunnelSimpleIcon size={13} />
          </button>
        }
      />
      <PopoverContent align="end" className="w-72">
        <div className="space-y-2">
          <div>
            <p className="text-xs font-semibold text-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground">Select values to show</p>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search values..."
            className="h-8"
          />
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-1">
            {values.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={draft.includes(value)}
                  onChange={() =>
                    setDraft((current) =>
                      current.includes(value)
                        ? current.filter((item) => item !== value)
                        : [...current, value],
                    )
                  }
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span className="truncate" title={value}>
                  {value}
                </span>
              </label>
            ))}
          </div>
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setDraft([]);
                onApply([]);
              }}
            >
              Clear
            </Button>
            <Button type="button" size="sm" onClick={() => onApply(draft)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
