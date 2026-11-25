import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProjectDetail } from "@/features/projects/components/ProjectDetail";

export const metadata: Metadata = { title: "Project Detail" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Not a project id (e.g. an old "/projects/all" link): show the projects list.
  if (!UUID.test(id)) redirect("/projects");
  return <ProjectDetail projectId={id} />;
}
