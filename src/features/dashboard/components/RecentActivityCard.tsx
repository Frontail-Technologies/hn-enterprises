import { SectionCard } from "@/components/shared/SectionCard";
import { cn } from "@/lib/utils";
import { recentActivity } from "../data/dashboard.data";

export function RecentActivityCard() {
  return (
    <SectionCard
      title="Recent Activity"
      className="pb-5"
      action={
        <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
          View all
        </button>
      }
    >
      <div className="space-y-2">
        {recentActivity.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div
              key={`${activity.title}-${activity.time}`}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] gap-3 items-center rounded-lg px-3 py-2.5",
                index % 2 === 0 ? "bg-muted/55" : "bg-background",
              )}
            >
              <div className="h-6 w-6 rounded-md bg-card text-muted-foreground ring-1 ring-border/70 flex items-center justify-center">
                <Icon size={13} weight="bold" />
              </div>
              <p className="text-xs font-medium text-foreground leading-snug min-w-0">
                {activity.title}
              </p>
              <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
