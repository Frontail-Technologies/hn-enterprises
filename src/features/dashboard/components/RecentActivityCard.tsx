import Link from "next/link";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "../data/dashboard.data";
import type { ActivityType } from "../services/activity.service";

interface RecentActivityCardProps {
  items: ActivityItem[];
}

const TYPE_ICON_CLASSES: Record<ActivityType, string> = {
  Work: "bg-info-soft text-info-foreground",
  Survey: "bg-status-purple-bg text-status-purple-fg",
  DPR: "bg-warning-soft text-warning-foreground",
  Billing: "bg-success-soft text-success-foreground",
  System: "bg-surface-muted text-muted-foreground",
};

export function RecentActivityCard({ items }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-3">
        <CardTitle>Recent Activity</CardTitle>
        <CardAction>
          <Link href="/activity" className={buttonVariants({ variant: "link", size: "sm" })}>
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="relative space-y-2.5 before:absolute before:top-1 before:bottom-1 before:left-3.25 before:w-px before:bg-border">
            {items.map((activity, index) => {
              const Icon = activity.icon;

              return (
                <div
                  key={("id" in activity ? String(activity.id) : "") || `${activity.title}-${activity.time}-${index}`}
                  className="relative flex items-center gap-3 pl-0"
                >
                  <span
                    className={cn(
                      "relative z-10 flex size-6.5 shrink-0 items-center justify-center rounded-full ring-2 ring-card",
                      TYPE_ICON_CLASSES[activity.type],
                    )}
                  >
                    <Icon size={13} weight="bold" />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-body-small font-semibold text-foreground">
                    {activity.title}
                  </p>
                  <span className="shrink-0 text-meta text-muted-foreground/70 whitespace-nowrap">{activity.time}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-6 text-center text-body-small text-muted-foreground">No recent activity.</p>
        )}
      </CardContent>
    </Card>
  );
}
