import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckSquare, Square, List } from "@phosphor-icons/react";
import type { DashboardMetric } from "../data/dashboard.data";

export function DashboardMetricFilter({
  metrics,
  selectedIds,
  onChange,
}: {
  metrics: DashboardMetric[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <List size={16} />
        <span>Customize Stats</span>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-64 p-2">
        <div className="mb-2 px-2 text-sm font-semibold text-foreground">
          Select Stats to Display
        </div>
        <div className="flex max-h-[300px] flex-col gap-0.5 overflow-y-auto">
          {metrics.map((metric) => {
            const isSelected = selectedIds.includes(metric.id);
            return (
              <button
                key={metric.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onChange(selectedIds.filter((id) => id !== metric.id));
                  } else {
                    onChange([...selectedIds, metric.id]);
                  }
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
              >
                {isSelected ? (
                  <CheckSquare size={16} className="shrink-0 text-primary" weight="fill" />
                ) : (
                  <Square size={16} className="shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">{metric.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
