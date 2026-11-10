"use client";

import { useState } from "react";
import { useListState } from "@/components/shared/list";
import { useDownloadHolidays } from "@/features/exports/hooks/useExports";
import { useBulkDeleteHolidays, useHolidaysQuery } from "../../hooks/useMasters";

export function useHolidaysTab() {
  const list = useListState({ pageSize: 50, storageKey: "masters-holidays" });
  const { data: holidays = [], isLoading, isError, refetch } = useHolidaysQuery();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteHolidays();
  const download = useDownloadHolidays();

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(list.selection));
    setBulkDeleteOpen(false);
    list.clearSelection();
  }

  function handleExport() {
    download.mutate({ search: list.search.trim() || undefined });
  }

  return {
    list,
    holidays,
    isLoading,
    isError,
    refetch,
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
