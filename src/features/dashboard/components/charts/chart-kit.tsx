"use client";

import { useState, type ReactNode } from "react";
import { ChartBarIcon, TableIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Chart colours: categorical slots 1–2 of the validated reference palette
 * (blue, orange — CVD ΔE 24.7, normal ΔE 33.6, ≥3:1 on the card surface).
 * Single-series charts use slot 1. Text never takes a series colour.
 */
export const SERIES = {
  primary: "#2a78d6",
  secondary: "#eb6834",
} as const;

/** Recessive axes/grid shared by every chart. */
export const axisProps = {
  stroke: "var(--muted-foreground)",
  tick: { fill: "var(--muted-foreground)", fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

export const gridProps = { stroke: "var(--border)", strokeDasharray: "0", vertical: false } as const;

const inrFull = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** ₹ amount in Indian units: ₹950, ₹12.5K, ₹4.2L, ₹1.3Cr. */
export function inrCompact(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7)}Cr`;
  if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5)}L`;
  if (abs >= 1e3) return `${sign}₹${trim(abs / 1e3)}K`;
  return `${sign}₹${Math.round(abs)}`;
}
const trim = (value: number) => (value >= 100 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, ""));

export const inr = (value: number) => inrFull.format(value);

/** Hover card for every chart: title row + one line per value (swatch + label + value in text ink). */
export function ChartTooltipCard({ title, rows }: { title: string; rows: { label: string; value: string; color?: string; muted?: boolean }[] }) {
  return (
    <div className="min-w-44 rounded-lg border border-border bg-card px-3 py-2 text-[13px] shadow-floating">
      <p className="mb-1.5 font-semibold text-foreground">{title}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            {row.color ? <span className="size-2.5 shrink-0 rounded-sm" style={{ background: row.color }} aria-hidden="true" /> : null}
            <span className={cn("flex-1", row.muted ? "text-muted-foreground" : "text-foreground")}>{row.label}</span>
            <span className="font-semibold text-foreground tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="size-2.5 rounded-sm" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

interface ChartCardProps {
  title: string;
  description?: string;
  /** Right side of the header, e.g. a headline figure or legend. */
  aside?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyText?: string;
  /** Accessible table version of the same data (toggle in the header). */
  table: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Card frame for a dashboard chart: title, optional aside, Chart/Table toggle, loading & empty states. */
export function ChartCard({ title, description, aside, isLoading, isEmpty, emptyText = "No data for this period.", table, children, className }: ChartCardProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <section className={cn("flex min-w-0 flex-col gap-4 rounded-card border border-border bg-card p-5 shadow-card", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-section-title">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {aside}
          <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label={`${title} view`}>
            {(["chart", "table"] as const).map((option) => {
              const Icon = option === "chart" ? ChartBarIcon : TableIcon;
              const active = view === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  title={option === "chart" ? "Show chart" : "Show table"}
                  onClick={() => setView(option)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md transition-colors",
                    active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon size={15} />
                  <span className="sr-only">{option === "chart" ? "Chart" : "Table"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>
      {isLoading ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : isEmpty ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">{emptyText}</div>
      ) : view === "chart" ? (
        <div className="h-64 min-w-0">{children}</div>
      ) : (
        <div className="max-h-64 overflow-auto">{table}</div>
      )}
    </section>
  );
}

/** Compact data table used by the Table view of each chart. */
export function ChartTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-[13px]">
      <thead className="sticky top-0 bg-card">
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          {headers.map((header, index) => (
            <th key={header} className={cn("py-2 font-semibold", index > 0 && "text-right")}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-b border-border last:border-b-0">
            {row.map((cell, index) => (
              <td key={index} className={cn("py-1.5", index > 0 ? "text-right tabular-nums" : "text-foreground")}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
