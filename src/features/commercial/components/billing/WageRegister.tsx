"use client";

import { useMemo, useState, type ReactNode } from "react";
import { format, subMonths } from "date-fns";
import { DownloadSimpleIcon, NotePencilIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { cn } from "@/lib/utils";
import { useWagesQuery } from "../../hooks/useWages";
import { money } from "../../utils/format";
import type { WageRecord } from "../../types/wage.types";
import { WageDrawer } from "./WageDrawer";

function monthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = subMonths(now, index);
    return { value: format(date, "yyyy-MM"), label: format(date, "MMMM yyyy") };
  });
}

export function WageRegister() {
  const options = useMemo(() => monthOptions(), []);
  const [month, setMonth] = useState(options[0].value);
  const { data: wages = [], isLoading: wagesLoading } = useWagesQuery({ month });
  const { data: plumbers = [], isLoading: plumbersLoading } = usePlumbersQuery();
  const plumberNameById = useMemo(() => new Map(plumbers.map((p) => [p.id, p.name])), [plumbers]);
  const isLoading = wagesLoading || plumbersLoading;

  const exportColumns: ExportColumn<WageRecord>[] = useMemo(
    () => [
      { label: "Name", getValue: (row) => plumberNameById.get(row.plumberId) ?? "Unknown" },
      { label: "Category", getValue: (row) => row.category },
      { label: "Rate of Wage", getValue: (row) => row.wageRate },
      { label: "Days Worked", getValue: (row) => row.daysWorked },
      { label: "Basic", getValue: (row) => row.basic },
      { label: "Total", getValue: (row) => row.total },
      { label: "PF", getValue: (row) => row.pf },
      { label: "ESIC", getValue: (row) => row.esic },
      { label: "Total Deduction", getValue: (row) => row.totalDeduction },
      { label: "Net Payment", getValue: (row) => row.netPayment },
      { label: "Status", getValue: (row) => row.status },
      { label: "Remarks", getValue: (row) => row.remarks },
    ],
    [plumberNameById],
  );

  return (
    <section className="rounded-lg border border-border/70 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Wage Register</p>
          <p className="text-xs text-muted-foreground">
            Payroll-style register with attendance days, deductions and net payment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={month} onValueChange={(value) => { if (value) setMonth(value); }}>
            <SelectTrigger className="h-8 w-37.5 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <WageDrawer month={month} triggerLabel="Add Wage Entry" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void exportRowsToExcel(`wage-sheet-${month}.xlsx`, exportColumns, wages)}
          >
            <DownloadSimpleIcon size={14} />
            Export Wage Sheet
          </Button>
        </div>
      </div>
      <div className="overflow-y-auto">
        <div className="flex min-w-0">
          <div className="shrink-0 border-r border-border/70">
            <table className="w-max border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <RegisterHeaderCell className="w-16 min-w-16">Sl No.</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-52 min-w-52">Name</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-36 min-w-36">Category</RegisterHeaderCell>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="h-28 border-b border-r border-border/55 bg-card px-2 py-2 text-center">
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner />
                      </div>
                    </td>
                  </tr>
                ) : wages.map((row, index) => (
                  <tr key={row.id} className="hover:bg-muted/25">
                    <RegisterBodyCell className="text-center font-medium">{index + 1}</RegisterBodyCell>
                    <RegisterBodyCell className="font-medium text-foreground">
                      {plumberNameById.get(row.plumberId) ?? "Unknown"}
                    </RegisterBodyCell>
                    <RegisterBodyCell>{row.category}</RegisterBodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto">
            <table className="min-w-max border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <RegisterHeaderCell className="w-32 min-w-32 text-right">Rate of Wage</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-center">Days Worked</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-right">Basic</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-right">Total</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-28 min-w-28 text-right">PF</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-28 min-w-28 text-right">ESIC</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-36 min-w-36 text-right">Total Deduction</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-36 min-w-36 text-right">Net Payment</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-center">Status</RegisterHeaderCell>
                  <RegisterHeaderCell className="w-20 min-w-20 text-center">Edit</RegisterHeaderCell>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="h-28 border-b border-r border-border/55 bg-card px-2 py-2 text-center">
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner />
                      </div>
                    </td>
                  </tr>
                ) : wages.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/25">
                    <RegisterBodyCell className="text-right">{money(row.wageRate)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-center font-medium">{row.daysWorked}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.basic)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.total)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.pf)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.esic)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right">{money(row.totalDeduction)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-right font-semibold">{money(row.netPayment)}</RegisterBodyCell>
                    <RegisterBodyCell className="text-center">
                      <StatusBadge status={row.status} />
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-center">
                      <WageDrawer month={month} wage={row} icon={<NotePencilIcon size={15} />} iconOnly />
                    </RegisterBodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegisterHeaderCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 h-11 border-b border-r border-border/70 bg-secondary/90 px-2 py-2 text-left align-middle text-xs font-semibold text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function RegisterBodyCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("h-10 border-b border-r border-border/55 bg-card px-2 py-2 text-sm text-foreground", className)}>
      {children}
    </td>
  );
}
