import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Selection state for the Customers bulk-operations toolbar (§28).
 *
 * The Customers page already loads every matching row client-side (see
 * CustomersList/ExcelDataGrid), so "select all N matching" can be resolved to
 * a concrete id set locally instead of carrying an abstract filter-mode
 * selection around the UI - the backend still exposes a real filter-mode
 * bulk API (customers-bulk.service.ts) for when a selection needs to be
 * resolved server-side, but the frontend always sends the concrete ids it
 * already has, since that's the set the user actually sees on screen.
 *
 * `filterSignature` should change whenever the active search/filters change
 * (not on pagination) - when it does and a selection exists, the selection is
 * cleared per §7 rather than silently carried over to a different dataset.
 */
export function useBulkCustomerSelection(filterSignature: string) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const seenSignature = useRef<string | null>(null);

  useEffect(() => {
    if (seenSignature.current === null) {
      seenSignature.current = filterSignature;
      return;
    }
    if (seenSignature.current === filterSignature) return;
    seenSignature.current = filterSignature;

    setSelectedIds((current) => {
      if (current.size === 0) return current;
      toast.info("Selection cleared because filters changed.");
      return new Set();
    });
  }, [filterSignature]);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback((pageIds: string[]) => {
    setSelectedIds((current) => {
      const allSelected = pageIds.length > 0 && pageIds.every((id) => current.has(id));
      const next = new Set(current);
      for (const id of pageIds) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllMatching = useCallback((filteredIds: string[]) => {
    setSelectedIds(new Set(filteredIds));
  }, []);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  return { selectedIds, toggleRow, toggleAllOnPage, selectAllMatching, clear };
}
