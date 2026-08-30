"use client";

import { ImportWorkspace } from "@/components/shared/import-workspace";
import { useUsersImportConfig } from "../import/usersImportConfig";

export function UsersImport() {
  const config = useUsersImportConfig();
  return <ImportWorkspace config={config} backHref="/users" backLabel="Back to Users & Roles" />;
}
