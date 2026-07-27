import Link from "next/link";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recentActivity, type ActivityItem } from "../data/dashboard.data";

interface RecentActivityCardProps {
  items?: ActivityItem[];
}

export function RecentActivityCard({ items = recentActivity }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-2.5">
        <CardTitle>Recent Activity</CardTitle>
        <CardAction>
          <Button variant="link" size="sm" render={<Link href="/activity" />}>
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((activity, index) => {
            const Icon = activity.icon;

            return (
              <div
                key={`${activity.title}-${activity.time}`}
                className={cn(
                  "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-3 py-2.5",
                  index % 2 === 0 ? "bg-muted/55" : "bg-background",
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-card text-muted-foreground ring-1 ring-border/70">
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
      </CardContent>
    </Card>
  );
}
