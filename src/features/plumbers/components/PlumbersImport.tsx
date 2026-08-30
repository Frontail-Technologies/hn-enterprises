"use client";

import { ImportWorkspace } from "@/components/shared/import-workspace";
import { usePlumbersImportConfig } from "../import/plumbersImportConfig";

export function PlumbersImport() {
  const config = usePlumbersImportConfig();
  return <ImportWorkspace config={config} backHref="/plumbers" backLabel="Back to Plumbers" />;
}
