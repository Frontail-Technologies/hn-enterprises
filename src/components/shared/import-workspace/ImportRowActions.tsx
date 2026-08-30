import { ArrowCounterClockwiseIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { ImportRowDraft } from "./types";

export function ImportRowActions<TData>({
  row,
  onEdit,
  onToggleRemove,
  isRemoving,
}: {
  row: ImportRowDraft<TData>;
  onEdit: () => void;
  onToggleRemove: (removed: boolean) => void;
  isRemoving: boolean;
}) {
  if (row.isImported) {
    return <span className="text-xs font-medium text-status-success-fg">Imported</span>;
  }

  if (row.isRemoved) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => onToggleRemove(false)} disabled={isRemoving}>
        {isRemoving ? <LoadingSpinner size="sm" /> : <ArrowCounterClockwiseIcon size={14} />}
        Undo
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit row" onClick={onEdit}>
        <PencilSimpleIcon size={14} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Remove row"
        onClick={() => onToggleRemove(true)}
        disabled={isRemoving}
      >
        {isRemoving ? <LoadingSpinner size="sm" /> : <TrashIcon size={14} />}
      </Button>
    </div>
  );
}
