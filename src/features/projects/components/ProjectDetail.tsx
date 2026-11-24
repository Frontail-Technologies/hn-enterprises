"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BuildingsIcon,
  CalendarBlankIcon,
  HashIcon,
  MapPinIcon,
  NotePencilIcon,
  UploadSimpleIcon,
  UsersIcon,
  HardHatIcon,
  TagIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoading } from "@/components/shared/PageLoading";
import { RecordHeader } from "@/components/shared/record";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProjectQuery } from "@/features/projects/hooks/useProjects";
import { ProjectTabs } from "./detail/ProjectOverviewTab";
import { formatDate } from "./detail/project-detail.utils";

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

  const dates = [project.startDate, project.plannedEndDate].filter(Boolean).map((date) => formatDate(date));

  return (
    <div className="flex flex-col gap-6">
      <RecordHeader
        title={project.name}
        badges={<StatusBadge status={project.status} />}
        meta={[
          { icon: HashIcon, label: project.code },
          { icon: MapPinIcon, label: project.city },
          { icon: BuildingsIcon, label: project.client },
          { icon: UsersIcon, label: project.consultant ? `Consultant: ${project.consultant}` : "" },
          { icon: HardHatIcon, label: project.contractor ? `Contractor: ${project.contractor}` : "" },
          { icon: TagIcon, label: project.projectType },
          { icon: CalendarBlankIcon, label: dates.join(" – ") },
          { icon: UserIcon, label: project.assignedManager },
        ]}
        figure={project.contractValue ? { label: "Contract value", value: project.contractValue } : undefined}
        actions={
          <>
            <Link href={`/customers/import?projectId=${encodeURIComponent(project.id)}`} className={buttonVariants({ variant: "outline" })}>
              <UploadSimpleIcon size={15} />
              Import customers
            </Link>
            <Link href={`/projects/${project.id}/edit`} className={buttonVariants({ variant: "outline" })}>
              <NotePencilIcon size={15} />
              Edit project
            </Link>
          </>
        }
      />

      <ProjectTabs project={project} />
    </div>
  );
}
