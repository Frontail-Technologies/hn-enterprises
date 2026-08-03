import { cn } from "@/lib/utils";
import type { ComplaintPriority } from "../../types/complaint.types";

const PRIORITY_CLASSES: Record<ComplaintPriority, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-status-warning-bg text-status-warning-fg border-status-warning/20",
  High: "bg-destructive/10 text-destructive border-destructive/20",
};

export function ComplaintPriorityBadge({ priority, className }: { priority: ComplaintPriority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2 py-0.5 border rounded-full",
        PRIORITY_CLASSES[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}
