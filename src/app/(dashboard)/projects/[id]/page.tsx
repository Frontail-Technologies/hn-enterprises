import type { Metadata } from "next";
import { ProjectDetail } from "@/features/projects/components/ProjectDetail";
import { getProjectById } from "@/features/projects/services/projects.service";

export const metadata: Metadata = { title: "Project Detail" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetail project={getProjectById(id)} />;
}
