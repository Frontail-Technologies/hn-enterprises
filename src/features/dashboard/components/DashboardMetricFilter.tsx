"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckSquareIcon, SquareIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="compact"
        className="w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontalIcon size={14} className="size-3.5" />
        <span>Customize</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden rounded-xl! p-0 sm:max-w-sm">
          <DialogHeader className="border-b border-border p-4 pb-3">
            <DialogTitle>Customize stats</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto p-2">
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
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body-small transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
                >
                  {isSelected ? (
                    <CheckSquareIcon size={16} className="shrink-0 text-primary" weight="fill" />
                  ) : (
                    <SquareIcon size={16} className="shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{metric.label}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
