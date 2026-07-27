import type { CSSProperties } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { workProgress, type ProgressSegment } from "../data/dashboard.data";

interface WorkProgressCardProps {
  segments?: ProgressSegment[];
}

export function WorkProgressCard({ segments = workProgress }: WorkProgressCardProps) {
  const completed = segments[0]?.value ?? 0;
  const inProgressEnd = completed + (segments[1]?.value ?? 0);
  const chartStyle = {
    background: `conic-gradient(var(--primary) 0 ${completed}%, var(--status-warning-bg) ${completed}% ${inProgressEnd}%, var(--border) ${inProgressEnd}% 100%)`,
  } satisfies CSSProperties;

  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-2.5">
        <CardTitle>Work Progress (Overall)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid items-center gap-8 sm:grid-cols-[230px_1fr]">
          <div
            className="relative mx-auto h-52 w-52 rounded-full"
            style={chartStyle}
          >
            <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-card shadow-inner">
              <span className="text-4xl font-semibold leading-none text-foreground">
                {completed}%
              </span>
              <span className="mt-1 text-xs font-medium text-muted-foreground">
                Overall Progress
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            {segments.map((segment) => (
              <div
                key={segment.label}
                className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-sm",
                      segment.className,
                    )}
                  />
                  <span className="truncate font-medium text-foreground">
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
      </CardContent>
    </Card>
  );
}