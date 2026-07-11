import type { Metadata } from "next";
import { WorkProgressDetail } from "@/features/work-progress/components/WorkProgressDetail";
import { getWorkProgressById } from "@/features/work-progress/services/work-progress.service";

export const metadata: Metadata = {
  title: "Work Progress Detail",
};

interface WorkProgressDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkProgressDetailPage({
  params,
}: WorkProgressDetailPageProps) {
  const { id } = await params;
  const record = getWorkProgressById(id);

  return <WorkProgressDetail record={record} />;
}
