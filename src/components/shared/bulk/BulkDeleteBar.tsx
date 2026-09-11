"use client";

import { TrashIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface BulkDeleteBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  label?: string;
}

export function BulkDeleteBar({ selectedCount, onClear, onDelete, label = "Delete Selected" }: BulkDeleteBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-2.5 shadow-subtle">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{selectedCount} selected</span>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground" onClick={onClear}>
          <XIcon size={13} />
          Clear
        </Button>
      </div>
      <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 border-destructive/30 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={onDelete}>
        <TrashIcon size={14} />
        {label}
      </Button>
    </div>
  );
}
