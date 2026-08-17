"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowCounterClockwiseIcon, DotsSixVerticalIcon, GearSixIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCustomerColumnsQuery, useResetCustomerColumns, useSaveCustomerColumns } from "../hooks/useCustomerColumns";
import type { ResolvedCustomerColumn } from "../services/customers.service";

// Compact, single flat draggable list (not a side Sheet) - order + visibility
// saved here is the SAME resolved config both the master sheet and the Excel
// export read from (§ shared column config), so there is nothing else to sync.
export function CustomizeColumnsDialog() {
  const [open, setOpen] = useState(false);
  const columnsQuery = useCustomerColumnsQuery();
  const saveColumns = useSaveCustomerColumns();
  const resetColumns = useResetCustomerColumns();
  const [draft, setDraft] = useState<ResolvedCustomerColumn[]>([]);
  const [search, setSearch] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && columnsQuery.data) {
      setDraft(columnsQuery.data);
      setSearch("");
    }
    setOpen(nextOpen);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return draft;
    return draft.filter(
      (column) => column.label.toLowerCase().includes(query) || column.group.toLowerCase().includes(query),
    );
  }, [draft, search]);

  // Reordering a filtered subset would be ambiguous (its positions don't map
  // cleanly onto the full list) - drag is only enabled with no active search.
  const dragEnabled = search.trim().length === 0;
  const activeColumn = activeKey ? draft.find((column) => column.key === activeKey) : undefined;

  function handleDragEnd(event: DragEndEvent) {
    setActiveKey(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDraft((current) => {
      const oldIndex = current.findIndex((column) => column.key === active.id);
      const newIndex = current.findIndex((column) => column.key === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  }

  function toggleVisible(key: string) {
    setDraft((current) => current.map((column) => (column.key === key ? { ...column, visible: !column.visible } : column)));
  }

  function handleSave() {
    saveColumns.mutate(
      draft.map((column) => ({ key: column.key, visible: column.visible })),
      { onSuccess: () => setOpen(false) },
    );
  }

  function handleReset() {
    resetColumns.mutate(undefined, { onSuccess: (resolved) => setDraft(resolved) });
  }

  const visibleCount = draft.filter((column) => column.visible).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <GearSixIcon size={15} />
        Columns
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border/70 p-4">
          <DialogTitle>Customize Columns</DialogTitle>
          <DialogDescription>
            Drag to reorder, check to show or hide. {visibleCount} of {draft.length} columns visible - the same order is
            used for Excel export.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 border-b border-border/70 p-3">
          <div className="relative">
            <MagnifyingGlassIcon size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search columns..."
              className="h-8 pl-8"
            />
          </div>
          {!dragEnabled ? <p className="mt-1.5 text-[11px] text-muted-foreground">Clear search to reorder columns.</p> : null}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {columnsQuery.isLoading ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : !filtered.length ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">No columns match &ldquo;{search}&rdquo;.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event) => setActiveKey(String(event.active.id))}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveKey(null)}
            >
              <SortableContext items={filtered.map((column) => column.key)} strategy={verticalListSortingStrategy}>
                <div className="space-y-0.5">
                  {filtered.map((column) => (
                    <ColumnRow key={column.key} column={column} dragEnabled={dragEnabled} onToggle={() => toggleVisible(column.key)} />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeColumn ? (
                  <div className="rounded-md border border-primary/40 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-lg">
                    {activeColumn.label}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 flex-row items-center justify-between rounded-b-xl border-t bg-muted/50 p-4">
          <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={resetColumns.isPending}>
            <ArrowCounterClockwiseIcon size={14} />
            {resetColumns.isPending ? "Resetting..." : "Reset to Default"}
          </Button>
          <div className="flex gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="button" onClick={handleSave} disabled={saveColumns.isPending}>
              {saveColumns.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ColumnRow({
  column,
  dragEnabled,
  onToggle,
}: {
  column: ResolvedCustomerColumn;
  dragEnabled: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.key,
    disabled: !dragEnabled,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50",
        isDragging && "z-10 bg-card opacity-70 shadow",
      )}
    >
      <button
        type="button"
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground",
          dragEnabled ? "cursor-grab hover:bg-muted hover:text-foreground active:cursor-grabbing" : "cursor-not-allowed opacity-30",
        )}
        aria-label={`Reorder ${column.label}`}
        {...attributes}
        {...listeners}
      >
        <DotsSixVerticalIcon size={16} weight="bold" />
      </button>
      <span className="min-w-0 flex-1 truncate text-foreground" title={column.label}>
        {column.label}
      </span>
      <span className="shrink-0 text-[11px] text-muted-foreground">{column.group}</span>
      <Checkbox
        checked={column.visible}
        onCheckedChange={onToggle}
        aria-label={column.visible ? `Hide ${column.label}` : `Show ${column.label}`}
      />
    </div>
  );
}
