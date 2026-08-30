"use client";

import { useSearchParams } from "next/navigation";
import { ImportWorkspace } from "@/components/shared/import-workspace";
import { useMasterValuesImportConfig } from "../import/masterValuesImportConfig";
import type { MasterValueCategory } from "../types/masters.types";

export function MasterValuesImport() {
  const searchParams = useSearchParams();
  const category = (searchParams.get("category") ?? "Payment Types") as MasterValueCategory;
  const config = useMasterValuesImportConfig(category);
  return (
    <ImportWorkspace
      config={config}
      backHref={`/masters?category=${encodeURIComponent(category)}`}
      backLabel="Back to Masters"
    />
  );
}
