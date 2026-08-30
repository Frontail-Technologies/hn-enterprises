"use client";

import { ImportWorkspace } from "@/components/shared/import-workspace";
import { useMaterialsImportConfig } from "../import/materialsImportConfig";

export function MaterialsImport() {
  const config = useMaterialsImportConfig();
  return <ImportWorkspace config={config} backHref="/inventory" backLabel="Back to Inventory" />;
}
