import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
