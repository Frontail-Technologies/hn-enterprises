import type { Metadata } from "next";
import { WorkProgressUpdateForm } from "@/features/work-progress/components/WorkProgressUpdateForm";
import { getWorkProgressById } from "@/features/work-progress/services/work-progress.service";

export const metadata: Metadata = {
  title: "Update Work Progress",
};

interface WorkProgressUpdatePageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkProgressUpdatePage({
  params,
}: WorkProgressUpdatePageProps) {
  const { id } = await params;
  const record = getWorkProgressById(id);

  return <WorkProgressUpdateForm record={record} />;
}
