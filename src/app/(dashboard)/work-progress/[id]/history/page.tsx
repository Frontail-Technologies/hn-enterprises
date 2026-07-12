import type { Metadata } from "next";
import { WorkProgressHistoryPage } from "@/features/work-progress/components/WorkProgressHistoryPage";
import { getWorkProgressById } from "@/features/work-progress/services/work-progress.service";

export const metadata: Metadata = {
  title: "Work Progress History",
};

interface WorkProgressHistoryRouteProps {
  params: Promise<{ id: string }>;
}

export default async function WorkProgressHistoryRoute({
  params,
}: WorkProgressHistoryRouteProps) {
  const { id } = await params;
  const record = getWorkProgressById(id);

  return <WorkProgressHistoryPage record={record} />;
}
