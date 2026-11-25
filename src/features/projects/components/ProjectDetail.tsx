"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { NotePencilIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoading } from "@/components/shared/PageLoading";
import { RecordHeader } from "@/components/shared/record";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProjectQuery } from "@/features/projects/hooks/useProjects";
import { ProjectTabs } from "./detail/ProjectOverviewTab";

/**
 * Old Project-detail links (`?section=…`, from when this page embedded every
 * list) now open the dedicated page, filtered to this project.
 */
function legacySectionTarget(section: string | null, projectId: string, statKey: string | null) {
  const scoped = (path: string) => `${path}?projectId=${encodeURIComponent(projectId)}`;
  switch (section) {
    case "customers":
      return scoped("/customers") + (statKey ? `&statKey=${encodeURIComponent(statKey)}` : "");
    case "billing":
      return scoped("/billing");
    case "expenses":
      return scoped("/payments");
    case "materials":
      return scoped("/inventory");
    case "execution":
      return "/planning";
    default:
      return null;
  }
}

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data: project, isLoading, isError } = useProjectQuery(projectId);
  const router = useRouter();
  const searchParams = useSearchParams();

  useBreadcrumbLabel(projectId, project?.name);

  const legacyTarget = legacySectionTarget(searchParams.get("section"), projectId, searchParams.get("statKey"));
  useEffect(() => {
    if (legacyTarget) router.replace(legacyTarget);
  }, [legacyTarget, router]);

  if (isLoading || legacyTarget) {
    return <PageLoading />;
  }

  if (isError || !project) {
    return (
      <EmptyState
        illustration="error"
        title="Couldn't load this project"
        description="It may have been removed, or the connection failed."
        action={{ label: "Back to projects", onClick: () => router.push("/projects") }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Name and status on top; contract value and actions in a row under it,
          above the tabs. The project's other details live on the Overview tab. */}
      <div className="flex flex-col gap-4">
        <RecordHeader title={project.name} badges={<StatusBadge status={project.status} />} />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {project.contractValue ? (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Contract value</span>
              <span className="text-2xl leading-tight font-bold tracking-tight text-foreground tabular-nums">{project.contractValue}</span>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/projects/${project.id}/edit`} className={buttonVariants({ variant: "default" })}>
              <NotePencilIcon size={15} />
              Edit project
            </Link>
            <Link href={`/customers/import?projectId=${encodeURIComponent(project.id)}`} className={buttonVariants({ variant: "outline" })}>
              <UploadSimpleIcon size={15} />
              Import customers
            </Link>
          </div>
        </div>
      </div>

      <ProjectTabs project={project} />
    </div>
  );
}
