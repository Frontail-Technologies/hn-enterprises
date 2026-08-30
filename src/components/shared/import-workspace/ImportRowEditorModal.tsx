"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { ImportRowDraft, RowEditorProps } from "./types";

export function ImportRowEditorModal<TData>({
  row,
  renderEditor,
  isSaving,
  error,
  onCancel,
  onSave,
}: {
  row: ImportRowDraft<TData> | null;
  renderEditor: (props: RowEditorProps<TData>) => React.ReactNode;
  isSaving: boolean;
  error: string;
  onCancel: () => void;
  onSave: (tempId: string, data: TData) => void;
}) {
  const [draft, setDraft] = useState<TData | null>(row ? row.data : null);

  // Row identity (tempId) changes each time a different row is opened for
  // editing - reseed the local draft from that row's current data then.
  // Adjusted during render (React's recommended alternative to a
  // setState-in-effect cascade) rather than in a useEffect.
  const [lastTempId, setLastTempId] = useState<string | null>(row?.tempId ?? null);
  if ((row?.tempId ?? null) !== lastTempId) {
    setLastTempId(row?.tempId ?? null);
    setDraft(row ? row.data : null);
  }

  const open = Boolean(row) && draft !== null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit row {row?.rowNumber}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fix the highlighted fields, then save to revalidate this row.
          </p>
        </DialogHeader>

        {row && draft !== null ? (
          <div className="space-y-3">
            {renderEditor({ data: draft, onChange: setDraft, errors: row.errors })}
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => row && draft !== null && onSave(row.tempId, draft)}
            disabled={isSaving || draft === null}
          >
            {isSaving ? <LoadingSpinner size="sm" /> : null}
            Save &amp; Validate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
