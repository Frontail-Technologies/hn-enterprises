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
  Work: "text-status-info-fg",
  Survey: "text-status-purple-fg",
  DPR: "text-status-warning-fg",
  Billing: "text-status-success-fg",
};

export function RecentActivityCard({ items }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-2.5">
        <CardTitle>Recent Activity</CardTitle>
        <CardAction>
          <Link href="/activity" className={buttonVariants({ variant: "link", size: "sm" })}>
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="space-y-2">
            {items.map((activity, index) => {
              const Icon = activity.icon;

              return (
                <div
                  key={`${activity.title}-${activity.time}`}
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-3 py-2.5",
                    index % 2 === 0 ? "bg-muted/40" : "bg-transparent",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md bg-card ring-1 ring-border/70",
                      TYPE_ICON_CLASSES[activity.type],
                    )}
                  >
                    <Icon size={13} weight="bold" />
                  </div>
                  <p className="min-w-0 text-xs font-medium leading-snug text-foreground">
                    {activity.title}
                  </p>
                  <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        )}
      </CardContent>
    </Card>
  );
}
