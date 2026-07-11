import type { Metadata } from "next";
import { ProjectForm } from "@/features/projects/components/ProjectForm";

export const metadata: Metadata = { title: "Create Project" };

export default function Page() {
  return <ProjectForm mode="create" />;
}
