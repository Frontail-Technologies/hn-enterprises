"use client";

import { TrashIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface BulkDeleteBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  label?: string;
}

// Minimal sticky bulk-action bar for entities that only support one bulk
// action (delete) - a smaller cousin of Customers'
// features/customers/components/bulk/BulkActionToolbar.tsx, which needs a
// dropdown-menu overflow because it has several bulk actions. With exactly
// one action there's nothing to put behind an overflow menu.
export function BulkDeleteBar({ selectedCount, onClear, onDelete, label = "Delete Selected" }: BulkDeleteBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span>{selectedCount} selected</span>
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
