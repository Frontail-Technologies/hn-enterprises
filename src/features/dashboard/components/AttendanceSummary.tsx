import { SectionCard } from "@/components/shared/SectionCard";
import type { DashboardOverviewAttendanceRow } from "@/features/dashboard/model/dashboard-overview.types";

const DOT_CLASS_BY_ID: Record<string, string> = {
  present: "bg-success",
  late: "bg-warning",
  absent: "bg-danger",
  leave: "bg-info",
};

export function AttendanceSummary({ rows }: { rows: DashboardOverviewAttendanceRow[] }) {
  return (
    <SectionCard title="Attendance Summary" className="flex h-full flex-col">
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className={`size-2.5 shrink-0 rounded-full ${DOT_CLASS_BY_ID[row.id] ?? "bg-muted-foreground"}`} />
              <div className="min-w-0">
                <p className="text-body-small font-medium text-foreground">{row.label}</p>
                <p className="text-meta text-muted-foreground/70">{row.helper}</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-foreground tabular-nums">{row.value}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
