import { CheckCircleIcon, WarningIcon } from "@phosphor-icons/react";
import { SectionCard } from "@/components/shared/SectionCard";
import { cn } from "@/lib/utils";
import type { DashboardOverviewAlert, DashboardOverviewAlertTone } from "@/features/dashboard/model/dashboard-overview.types";

const TONE_CLASSES: Record<DashboardOverviewAlertTone, string> = {
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning-foreground",
  info: "bg-info-soft text-info-foreground",
};

export function DashboardAlerts({ alerts }: { alerts: DashboardOverviewAlert[] }) {
  return (
    <SectionCard title="Alerts">
      <div className="space-y-1">
        {alerts.length ? (
          alerts.map((alert) => (
            <div key={alert.id} className={cn("flex gap-2.5 rounded-md p-2.5", TONE_CLASSES[alert.tone])}>
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-card/60">
                <WarningIcon size={13} weight="bold" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-body-small font-medium">{alert.title}</p>
                <p className="text-meta opacity-75">{alert.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2.5 py-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-foreground">
              <CheckCircleIcon size={14} weight="bold" />
            </span>
            <div className="min-w-0">
              <p className="text-body-small font-medium text-foreground">All clear</p>
              <p className="text-meta text-muted-foreground/70">No alerts need your attention right now.</p>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
