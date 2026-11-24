"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ImportWorkspace } from "@/components/shared/import-workspace";
import { PageLoading } from "@/components/shared/PageLoading";
import { useProjectQuery } from "@/features/projects/hooks/useProjects";
import { useCustomerImportConfig } from "../import/customerImportConfig";

export function CustomerImport() {
  // Opened from a project page (?projectId=...): import into that project.
  const projectId = useSearchParams().get("projectId") ?? "";
  const { data: project, isLoading } = useProjectQuery(projectId);
  const target = useMemo(() => (project ? { id: project.id, name: project.name } : undefined), [project]);
  const config = useCustomerImportConfig(target);

  if (projectId && isLoading) return <PageLoading />;

  return target ? (
    <ImportWorkspace config={config} backHref={`/projects/${target.id}`} backLabel="Back to project" />
  ) : (
    <ImportWorkspace config={config} backHref="/customers" backLabel="Back to Customers" />
  );
}
