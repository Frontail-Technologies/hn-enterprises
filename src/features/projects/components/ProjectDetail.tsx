"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NotePencilIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { PageLoading } from "@/components/shared/PageLoading";
import { ScrollableTabsList } from "@/components/shared/ScrollableTabsList";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProjectQuery } from "@/features/projects/hooks/useProjects";
import { ProjectActivityTab } from "./detail/ProjectActivityTab";
import { ProjectBillingTab } from "./detail/ProjectBillingTab";
import { ProjectCustomersTab } from "./detail/ProjectCustomersTab";
import { ProjectDocumentsTab } from "./detail/ProjectDocumentsTab";
import { ProjectExecutionTab } from "./detail/ProjectExecutionTab";
import { ProjectExpensesTab } from "./detail/ProjectExpensesTab";
import { ProjectMaterialsTab } from "./detail/ProjectMaterialsTab";
import { ProjectOverviewTab } from "./detail/ProjectOverviewTab";
import { ProjectTeamTab } from "./detail/ProjectTeamTab";

const SECTIONS = [
  { value: "overview", label: "Overview" },
  { value: "customers", label: "Customers" },
  { value: "execution", label: "Execution" },
  { value: "billing", label: "Billing" },
  { value: "expenses", label: "Expenses" },
  { value: "materials", label: "Materials" },
  { value: "team", label: "Team" },
  { value: "documents", label: "Documents" },
  { value: "activity", label: "Activity" },
] as const;

type Section = (typeof SECTIONS)[number]["value"];
const SECTION_VALUES = SECTIONS.map((item) => item.value) as string[];

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data: project, isLoading, isError } = useProjectQuery(projectId);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useBreadcrumbLabel(projectId, project?.name);

  const rawSection = searchParams.get("section");
  const section: Section = (SECTION_VALUES.includes(rawSection ?? "") ? rawSection : "overview") as Section;

  function setSection(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", next);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !project) {
    return <p className="p-4 text-sm text-destructive">Unable to load this project.</p>;
  }

  const metaItems = [project.code, project.city, project.client, project.projectType].filter(Boolean);

  return (
    <div className="space-y-3">
      <DetailHeader
        title={project.name}
        badges={<StatusBadge status={project.status} />}
        meta={
          metaItems.length > 0 ? (
            <span>{metaItems.join(" · ")}</span>
          ) : null
        }
        actions={
          <Link href={`/projects/${project.id}/edit`} className={buttonVariants({ variant: "outline", size: "default" })}>
            <NotePencilIcon size={15} />
            Edit Project
          </Link>
        }
      />

      <Tabs value={section} onValueChange={(value) => value && setSection(value)} className="gap-3">
        <div className="sticky top-0 z-40 -mx-1 bg-background px-1 backdrop-blur">
          <ScrollableTabsList>
            {SECTIONS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </ScrollableTabsList>
        </div>

        <TabsContent value="overview">
          <ProjectOverviewTab project={project} />
        </TabsContent>
        <TabsContent value="customers">
          <ProjectCustomersTab projectId={project.id} onClearStatKey={() => setSection("customers")} />
        </TabsContent>
        <TabsContent value="execution">
          <ProjectExecutionTab projectId={project.id} />
        </TabsContent>
        <TabsContent value="billing">
          <ProjectBillingTab
            projectId={project.id}
            projectName={project.name}
            onDrillDown={(statKey) => navigateToCustomersStatKey(router, pathname, statKey)}
          />
        </TabsContent>
        <TabsContent value="expenses">
          <ProjectExpensesTab projectId={project.id} projectName={project.name} />
        </TabsContent>
        <TabsContent value="materials">
          <ProjectMaterialsTab projectId={project.id} />
        </TabsContent>
        <TabsContent value="team">
          <ProjectTeamTab projectId={project.id} active={section === "team"} />
        </TabsContent>
        <TabsContent value="documents">
          <ProjectDocumentsTab projectId={project.id} />
        </TabsContent>
        <TabsContent value="activity">
          <ProjectActivityTab projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function navigateToCustomersStatKey(router: ReturnType<typeof useRouter>, pathname: string, statKey: string) {
  const params = new URLSearchParams();
  params.set("section", "customers");
  params.set("statKey", statKey);
  router.push(`${pathname}?${params.toString()}`, { scroll: false });
}
