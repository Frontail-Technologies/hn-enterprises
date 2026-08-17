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
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVerticalIcon, PauseCircleIcon, PlayCircleIcon, TrashIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { useDeleteDynamicField, useReorderDynamicFields, useSetDynamicFieldStatus } from "../hooks/useDynamicFields";
import type { CustomField } from "../types";
import { DynamicFieldDrawer } from "./DynamicFieldDrawer";

type GroupedFields = Record<string, CustomField[]>;

// Only Inactive fields may ever be permanently deleted (same rule the
// single-field "Permanently delete" action already enforces - a field must
// be deactivated first) so this only exposes a per-row checkbox, no "select
// all" affordance, since the grouped-by-section layout has no single
// natural "select all rows" header row the way a flat table does.
export interface DynamicFieldGridSelection {
  selectedIds: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
}

function groupFields(fields: CustomField[]): GroupedFields {
  const groups: GroupedFields = {};
  for (const field of fields) {
    (groups[field.group] ??= []).push(field);
  }
  for (const key of Object.keys(groups)) {
    groups[key] = [...groups[key]].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return groups;
}

function findContainer(groups: GroupedFields, id: string) {
  if (groups[id]) return id;
  return Object.keys(groups).find((key) => groups[key].some((field) => field.id === id));
}

export function DynamicFieldGrid({
  fields,
  isLoading,
  dragEnabled,
  selection,
}: {
  fields: CustomField[];
  isLoading?: boolean;
  dragEnabled: boolean;
  selection?: DynamicFieldGridSelection;
}) {
  const [groups, setGroups] = useState<GroupedFields>(() => groupFields(fields));
  const [activeId, setActiveId] = useState<string | null>(null);
  const reorder = useReorderDynamicFields();

  // Re-derive local (draggable) state when the source `fields` prop changes -
  // done during render, not in an effect, so it can't trigger an extra commit.
  const [syncedFields, setSyncedFields] = useState(fields);
  if (fields !== syncedFields) {
    setSyncedFields(fields);
    setGroups(groupFields(fields));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const groupNames = useMemo(() => Object.keys(groups).sort((a, b) => a.localeCompare(b)), [groups]);
  const activeField = activeId ? Object.values(groups).flat().find((field) => field.id === activeId) : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(groups, String(active.id));
    const overContainer = findContainer(groups, String(over.id));
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setGroups((current) => {
      const activeItems = current[activeContainer];
      const overItems = current[overContainer];
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      const overIndex = overItems.findIndex((item) => item.id === over.id);
      if (activeIndex === -1) return current;

      const moving = { ...activeItems[activeIndex], group: overContainer };
      const nextActive = activeItems.filter((item) => item.id !== active.id);
      const insertAt = overIndex === -1 ? overItems.length : overIndex;
      const nextOver = [...overItems.slice(0, insertAt), moving, ...overItems.slice(insertAt)];

      return { ...current, [activeContainer]: nextActive, [overContainer]: nextOver };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeContainer = findContainer(groups, String(active.id));
    if (!activeContainer) return;
    const overContainer = findContainer(groups, String(over.id)) ?? activeContainer;

    let finalGroups = groups;
    if (activeContainer === overContainer) {
      const items = groups[activeContainer];
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        finalGroups = { ...groups, [activeContainer]: arrayMove(items, oldIndex, newIndex) };
        setGroups(finalGroups);
      }
    }

    // Persist sequential positions for every group touched by this drag -
    // recomputing from scratch (rather than diffing) is simpler and can't
    // drift from what's rendered.
    const touched = new Set([activeContainer, overContainer]);
    const items = Array.from(touched).flatMap((groupName) =>
      (finalGroups[groupName] ?? []).map((field, index) => ({ id: field.id, groupName, sortOrder: index })),
    );
    if (items.length) reorder.mutate(items);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-lg border border-border/70 bg-white py-16">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!groupNames.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 bg-white px-4 py-16 text-center text-sm text-muted-foreground">
        No fields yet. Add your first field or import a sheet to get started.
      </div>
    );
  }

  const gridTemplate = selection
    ? "grid-cols-[28px_28px_1.6fr_1fr_0.9fr_1.3fr_0.9fr_0.7fr_100px_120px]"
    : "grid-cols-[28px_1.6fr_1fr_0.9fr_1.3fr_0.9fr_0.7fr_100px_120px]";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-hidden rounded-lg border border-border/70 bg-white">
        <div className={cn("grid gap-2 border-b border-border/70 bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground", gridTemplate)}>
          <span />
          {selection && <span />}
          <span>Label</span>
          <span className="text-center">Key</span>
          <span className="text-center">Value Type</span>
          <span className="text-center">Options</span>
          <span className="text-center">Access</span>
          <span className="text-center">Required</span>
          <span className="text-center">Status</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-border/60">
          {groupNames.map((groupName) => (
            <div key={groupName}>
              <div className="px-3 py-1.5 text-xs font-semibold text-foreground">
                {groupName} <span className="font-normal text-muted-foreground">({groups[groupName].length})</span>
              </div>
              <SortableContext items={groups[groupName].map((field) => field.id)} strategy={verticalListSortingStrategy}>
                {groups[groupName].map((field) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    allFields={fields}
                    dragEnabled={dragEnabled}
                    selection={selection}
                    gridTemplate={gridTemplate}
                  />
                ))}
              </SortableContext>
            </div>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeField ? (
          <div className="rounded-md border border-primary/40 bg-white px-3 py-2 text-sm font-medium text-foreground shadow-lg">
            {activeField.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function FieldRow({
  field,
  allFields,
  dragEnabled,
  selection,
  gridTemplate,
}: {
  field: CustomField;
  allFields: CustomField[];
  dragEnabled: boolean;
  selection?: DynamicFieldGridSelection;
  gridTemplate: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id, disabled: !dragEnabled });
  const setStatus = useSetDynamicFieldStatus();
  const deleteField = useDeleteDynamicField();
  const isSelected = Boolean(selection?.selectedIds.has(field.id));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid items-center gap-2 bg-white px-3 py-2 text-sm",
        gridTemplate,
        isDragging && "z-10 opacity-60",
      )}
    >
      <button
        type="button"
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded text-muted-foreground",
          dragEnabled ? "cursor-grab hover:bg-muted hover:text-foreground active:cursor-grabbing" : "cursor-not-allowed opacity-30",
        )}
        aria-label={`Reorder ${field.label}`}
        {...attributes}
        {...listeners}
      >
        <DotsSixVerticalIcon size={16} weight="bold" />
      </button>
      {selection && (
        <span className="flex justify-center">
          {field.status === "Inactive" ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => selection.onToggleRow(field.id)}
              aria-label={isSelected ? `Deselect ${field.label}` : `Select ${field.label}`}
            />
          ) : null}
        </span>
      )}
      <span className="truncate font-medium text-foreground" title={field.label}>{field.label}</span>
      <code className="max-w-full justify-self-center truncate rounded bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground" title={field.key}>{field.key}</code>
      <span className="text-center text-muted-foreground">{field.valueType}</span>
      <span className="truncate text-center text-xs text-muted-foreground" title={field.dropdownOptions.join(", ")}>
        {field.valueType === "Dropdown" ? field.dropdownOptions.join(", ") || "-" : "-"}
      </span>
      <span className="truncate text-center text-xs text-muted-foreground" title={field.supervisorAccess}>{field.supervisorAccess}</span>
      <span className="text-center text-xs text-muted-foreground">{field.required ? "Yes" : "No"}</span>
      <StatusBadge status={field.status} className="justify-self-center" />
      <div className="flex items-center justify-end gap-1">
        <DynamicFieldDrawer field={field} fields={allFields} iconOnly />
        {field.status === "Active" ? (
          <ActionTooltip label="Deactivate">
            <button
              type="button"
              aria-label={`Deactivate ${field.label}`}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              onClick={() => setStatus.mutate({ id: field.id, status: "Inactive" })}
              disabled={setStatus.isPending}
            >
              <PauseCircleIcon size={15} />
            </button>
          </ActionTooltip>
        ) : (
          <>
            <ActionTooltip label="Activate">
              <button
                type="button"
                aria-label={`Activate ${field.label}`}
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                onClick={() => setStatus.mutate({ id: field.id, status: "Active" })}
                disabled={setStatus.isPending}
              >
                <PlayCircleIcon size={15} className="text-status-success-fg" />
              </button>
            </ActionTooltip>
            <Dialog>
              <ActionTooltip label="Permanently delete">
                <DialogTrigger
                  render={
                    <button
                      type="button"
                      aria-label={`Permanently delete ${field.label}`}
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    />
                  }
                >
                  <TrashIcon size={15} className="text-destructive" />
                </DialogTrigger>
              </ActionTooltip>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Permanently delete &ldquo;{field.label}&rdquo;?</DialogTitle>
                  <DialogDescription>
                    This field will disappear everywhere and can no longer be edited. Values already saved under it
                    on customer records are not erased from the database, but nothing will be able to display or
                    manage them again.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
                  <DialogClose
                    render={<Button type="button" variant="destructive" onClick={() => deleteField.mutate(field.id)} />}
                  >
                    Permanently Delete
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
