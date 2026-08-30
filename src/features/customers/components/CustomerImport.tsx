"use client";

import { ImportWorkspace } from "@/components/shared/import-workspace";
import { useCustomerImportConfig } from "../import/customerImportConfig";

export function CustomerImport() {
  const config = useCustomerImportConfig();
  return <ImportWorkspace config={config} backHref="/customers" backLabel="Back to Customers" />;
}
