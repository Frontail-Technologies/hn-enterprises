"use client";

import { useMemo, type ReactNode } from "react";
import { CoinsIcon, MinusCircleIcon, HandCoinsIcon, HourglassIcon, NotePencilIcon } from "@phosphor-icons/react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCompactCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDeleteWage, useWagesQuery } from "../../hooks/useWages";
import { money, sum } from "../../utils/format";
import { WageDialog } from "./WageDialog";

export function WageRegister({ month }: { month: string }) {
  const { data: wages = [], isLoading: wagesLoading } = useWagesQuery({
    month,
  });
  const { data: plumbers = [], isLoading: plumbersLoading } =
    usePlumbersQuery();
  const plumberNameById = useMemo(
    () => new Map(plumbers.map((p) => [p.id, p.name])),
    [plumbers],
  );
  const isLoading = wagesLoading || plumbersLoading;
  const deleteWage = useDeleteWage();

  const wageTotals = {
    gross: sum(wages.map((row) => row.total)),
    deductions: sum(wages.map((row) => row.totalDeduction)),
    net: sum(wages.map((row) => row.netPayment)),
    pending: wages.filter((row) => row.status === "Pending").length,
  };

  return (
    <>
      <CompactStatGrid columns={4}>
        <DashboardStatCard label="Gross Wages" value={money(wageTotals.gross)} icon={CoinsIcon} tone="info" dense />
        <DashboardStatCard label="Deductions" value={money(wageTotals.deductions)} icon={MinusCircleIcon} tone="warning" dense />
        <DashboardStatCard label="Net Payable" value={money(wageTotals.net)} icon={HandCoinsIcon} tone="success" dense />
        <DashboardStatCard label="Pending Payments" value={formatCompactCount(wageTotals.pending)} icon={HourglassIcon} tone="danger" dense />
      </CompactStatGrid>
      <section className="rounded-lg border border-border/70 bg-card">
        <div className="border-b border-border/70 px-3 py-2">
          <p className="text-sm font-semibold text-foreground">
            Wage Register
          </p>
        </div>
        {!isLoading && wages.length === 0 ? (
          <EmptyState title="No wage records for this month" />
        ) : (
        <div className="overflow-auto">
          <table className="min-w-max border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <RegisterHeaderCell sticky={0} className="w-16 min-w-16">
                  Sl No.
                </RegisterHeaderCell>
                <RegisterHeaderCell sticky={64} className="w-52 min-w-52">
                  Name
                </RegisterHeaderCell>
                <RegisterHeaderCell
                  sticky={272}
                  edge
                  className="w-36 min-w-36"
                >
                  Category
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-32 min-w-32 text-right">
                  Rate of Wage
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-32 min-w-32 text-center">
                  Days Worked
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-32 min-w-32 text-right">
                  Basic
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-32 min-w-32 text-right">
                  Total
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-28 min-w-28 text-right">
                  PF
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-28 min-w-28 text-right">
                  ESIC
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-36 min-w-36 text-right">
                  Total Deduction
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-36 min-w-36 text-right">
                  Net Payment
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-32 min-w-32 text-center">
                  Status
                </RegisterHeaderCell>
                <RegisterHeaderCell className="w-24 min-w-24 text-center">
                  Actions
                </RegisterHeaderCell>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={13}
                    className="h-28 border-b border-r border-border/55 bg-card px-2 py-2 text-center"
                  >
                    <div className="flex items-center justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : (
                wages.map((row, index) => (
                  <tr key={row.id} className="hover:bg-muted/25">
                    <RegisterBodyCell
                      sticky={0}
                      className="text-center font-medium"
                    >
                      {index + 1}
                    </RegisterBodyCell>
                    <RegisterBodyCell
                      sticky={64}
                      className="font-medium text-foreground"
                    >
                      {plumberNameById.get(row.plumberId) ?? "Unknown"}
                    </RegisterBodyCell>
                    <RegisterBodyCell sticky={272} edge>
                      {row.category}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.wageRate)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-center font-medium">
                      {row.daysWorked}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.basic)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.total)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.pf)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.esic)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.totalDeduction)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right font-semibold">
                      {money(row.netPayment)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-center">
                      <StatusBadge status={row.status} />
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <WageDialog
                          month={month}
                          wage={row}
                          icon={<NotePencilIcon size={15} />}
                          iconOnly
                        />
                        <DeleteConfirmDialog
                          itemName={`${plumberNameById.get(row.plumberId) ?? "this"} wage entry`}
                          onConfirm={() => deleteWage.mutate(row.id)}
                        />
                      </div>
                    </RegisterBodyCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </section>
    </>
  );
}

function RegisterHeaderCell({
  children,
  className,
  sticky,
  edge,
}: {
  children: ReactNode;
  className?: string;
  sticky?: number;
  edge?: boolean;
}) {
  // No left-pinned columns on mobile - same rule as the shared grids
  // (remove-mobile-sub-navbar brief §6).
  const isMobile = useIsMobile();
  const effectiveSticky = isMobile ? undefined : sticky;
  return (
    <th
      style={effectiveSticky !== undefined ? { left: effectiveSticky } : undefined}
      className={cn(
        "sticky top-0 h-11 border-b border-r border-border/70 bg-table-header/90 px-2 py-2 text-left align-middle text-xs font-semibold text-muted-foreground",
        effectiveSticky === undefined
          ? "z-10"
          : "z-30 bg-table-header text-foreground",
        effectiveSticky !== undefined && edge && "shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
        className,
      )}
    >
      {children}
    </th>
  );
}

function RegisterBodyCell({
  children,
  className,
  sticky,
  edge,
}: {
  children: ReactNode;
  className?: string;
  sticky?: number;
  edge?: boolean;
}) {
  const isMobile = useIsMobile();
  const effectiveSticky = isMobile ? undefined : sticky;
  return (
    <td
      style={effectiveSticky !== undefined ? { left: effectiveSticky } : undefined}
      className={cn(
        "h-10 border-b border-r border-border/55 bg-card px-2 py-2 text-sm text-foreground",
        effectiveSticky !== undefined && "sticky z-10 bg-card",
        effectiveSticky !== undefined && edge && "shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
        className,
      )}
    >
      {children}
    </td>
  );
}
