import type { Metadata } from "next";
import { ProjectDetail } from "@/features/projects/components/ProjectDetail";

export const metadata: Metadata = { title: "Project Detail" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetail projectId={id} />;
}
