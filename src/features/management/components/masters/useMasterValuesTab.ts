"use client";

import { useMemo, useState } from "react";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useDownloadMasterValues } from "@/features/exports/hooks/useExports";
import { useBulkDeleteMasterValues, useMasterValuesQuery } from "../../hooks/useMasters";
import { CATEGORY_TO_BACKEND } from "../../services/masters.service";
import type { MasterValueCategory } from "../../types/masters.types";

export function useMasterValuesTab(category: MasterValueCategory) {
  const [search, setSearch] = useState("");
  const { data: values = [], isLoading } = useMasterValuesQuery(category, undefined);
  const selection = useBulkSelection();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteMasterValues(category);
  const download = useDownloadMasterValues();

  const data = useMemo(() => {
    const query = search.toLowerCase();
    return values.filter(
      (row) => !query || row.value.toLowerCase().includes(query) || row.description.toLowerCase().includes(query),
    );
  }, [values, search]);

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(selection.selectedIds));
    setBulkDeleteOpen(false);
    selection.clear();
  }

  function handleExport() {
    download.mutate({ category: CATEGORY_TO_BACKEND[category], search: search.trim() || undefined });
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
