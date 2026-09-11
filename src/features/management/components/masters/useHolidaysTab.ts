"use client";

import { useMemo, useState } from "react";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useDownloadHolidays } from "@/features/exports/hooks/useExports";
import { useBulkDeleteHolidays, useHolidaysQuery } from "../../hooks/useMasters";

export function useHolidaysTab() {
  const [search, setSearch] = useState("");
  const { data: holidays = [], isLoading } = useHolidaysQuery();
  const selection = useBulkSelection();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteHolidays();
  const download = useDownloadHolidays();

  const data = useMemo(() => {
    const query = search.toLowerCase();
    return holidays.filter((row) => !query || row.name.toLowerCase().includes(query) || row.type.toLowerCase().includes(query));
  }, [holidays, search]);

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(selection.selectedIds));
    setBulkDeleteOpen(false);
    selection.clear();
  }

  function handleExport() {
    download.mutate({ search: search.trim() || undefined });
  }

  return {
    data,
    isLoading,
    search: { value: search, onChange: setSearch },
    selection,
    bulkDelete: {
      open: bulkDeleteOpen,
      onOpenChange: setBulkDeleteOpen,
      isPending: bulkDelete.isPending,
      onConfirm: handleBulkDelete,
    },
    exportAction: {
      onExport: handleExport,
      isPending: download.isPending,
    },
  };
}
