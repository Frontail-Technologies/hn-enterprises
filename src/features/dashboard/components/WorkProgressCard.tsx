import type { CSSProperties } from "react";
import { SectionCard } from "@/components/shared/SectionCard";
import { cn } from "@/lib/utils";
import { workProgress } from "../data/dashboard.data";

export function WorkProgressCard() {
  const completed = workProgress[0].value;
  const inProgressEnd = completed + workProgress[1].value;
  const chartStyle = {
    background: `conic-gradient(var(--primary) 0 ${completed}%, var(--status-warning-bg) ${completed}% ${inProgressEnd}%, var(--border) ${inProgressEnd}% 100%)`,
  } satisfies CSSProperties;

  return (
    <SectionCard title="Work Progress (Overall)" className="pb-5">
      <div className="grid gap-8 sm:grid-cols-[230px_1fr] items-center">
        <div
          className="relative mx-auto h-52 w-52 rounded-full"
          style={chartStyle}
        >
          <div className="absolute inset-7 rounded-full bg-card flex flex-col items-center justify-center shadow-inner">
            <span className="text-4xl font-bold text-foreground leading-none">
              {completed}%
            </span>
            <span className="mt-1 text-xs font-medium text-muted-foreground">
              Overall Progress
            </span>
          </div>
        </div>

        <div className="space-y-3.5">
          {workProgress.map((segment) => (
            <div
              key={segment.label}
              className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-sm shrink-0",
                    segment.className,
                  )}
                />
                <span className="font-medium text-foreground truncate">
                  {segment.label}
                </span>
              </div>
              <span className="font-semibold text-foreground">
                {segment.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
