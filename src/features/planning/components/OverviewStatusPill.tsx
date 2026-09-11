import { cn } from "@/lib/utils";
import type { SupervisorGroupStatus } from "../model/planning-entry.rules";

export function OverviewStatusPill({ status }: { status: SupervisorGroupStatus }) {
  const classes =
    status === "Done"
      ? "bg-status-success-bg text-status-success-fg border-status-success/20"
      : status === "Partial"
        ? "bg-status-warning-bg text-status-warning-fg border-status-warning/20"
        : "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", classes)}>
      {status}
    </span>
  );
}
