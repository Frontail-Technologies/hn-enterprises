"use client";

import { ImportWorkspace } from "@/components/shared/import-workspace";
import { usePaymentsImportConfig } from "../import/paymentsImportConfig";

export function PaymentsImport() {
  const config = usePaymentsImportConfig();
  return <ImportWorkspace config={config} backHref="/payments" backLabel="Back to Payments" />;
}
