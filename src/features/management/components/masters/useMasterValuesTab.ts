"use client";

import { useState } from "react";
import { useListState } from "@/components/shared/list";
import { useDownloadMasterValues } from "@/features/exports/hooks/useExports";
import { useBulkDeleteMasterValues, useMasterValuesQuery } from "../../hooks/useMasters";
import { CATEGORY_TO_BACKEND } from "../../services/masters.service";
import type { MasterValueCategory } from "../../types/masters.types";

export function useMasterValuesTab(category: MasterValueCategory) {
  const list = useListState({ pageSize: 50, storageKey: "masters-values" });
  // Switching category must not carry a selection into another category's
  // bulk delete, so selection and paging reset (state adjusted during render).
  const [shownCategory, setShownCategory] = useState(category);
  if (shownCategory !== category) {
    setShownCategory(category);
    list.clearSelection();
    list.setPage(1);
  }
  const { data: values = [], isLoading, isError, refetch } = useMasterValuesQuery(category, undefined);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteMasterValues(category);
  const download = useDownloadMasterValues();

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(list.selection));
    setBulkDeleteOpen(false);
    list.clearSelection();
  }

  function handleExport() {
    download.mutate({ category: CATEGORY_TO_BACKEND[category], search: list.search.trim() || undefined });
  }

  return {
    list,
    values,
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
