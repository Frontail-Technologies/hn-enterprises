import type { Metadata } from "next";
import { ProjectForm } from "@/features/projects/components/ProjectForm";

export const metadata: Metadata = { title: "Edit Project" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectForm mode="edit" projectId={id} />;
}
