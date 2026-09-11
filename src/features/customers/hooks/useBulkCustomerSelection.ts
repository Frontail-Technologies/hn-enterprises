import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { RowSelectionState } from "@tanstack/react-table";

export function useBulkCustomerSelection(filterSignature: string) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const seenSignature = useRef<string | null>(null);

  useEffect(() => {
    if (seenSignature.current === null) {
      seenSignature.current = filterSignature;
      return;
    }
    if (seenSignature.current === filterSignature) return;
    seenSignature.current = filterSignature;

    setRowSelection((current) => {
      if (Object.keys(current).length === 0) return current;
      toast.info("Selection cleared because filters changed.");
      return {};
    });
  }, [filterSignature]);

  const selectedIds = useMemo(() => new Set(Object.keys(rowSelection)), [rowSelection]);

  const toggleRow = useCallback((id: string) => {
    setRowSelection((current) => {
      const next = { ...current };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback((pageIds: string[]) => {
    setRowSelection((current) => {
      const allSelected = pageIds.length > 0 && pageIds.every((id) => current[id]);
      const next = { ...current };
      for (const id of pageIds) {
        if (allSelected) delete next[id];
        else next[id] = true;
      }
      return next;
    });
  }, []);

  const selectAllMatching = useCallback((filteredIds: string[]) => {
    setRowSelection(Object.fromEntries(filteredIds.map((id) => [id, true as const])));
  }, []);

  const clear = useCallback(() => setRowSelection({}), []);

  return { selectedIds, rowSelection, setRowSelection, toggleRow, toggleAllOnPage, selectAllMatching, clear };
}
