"use client";

import { ImportWorkspace } from "@/components/shared/import-workspace";
import { useCustomFieldDefsImportConfig } from "../import/customFieldDefsImportConfig";

export function DynamicFieldsImport() {
  const config = useCustomFieldDefsImportConfig();
  return <ImportWorkspace config={config} backHref="/dynamic-fields" backLabel="Back to Dynamic Fields" />;
}
