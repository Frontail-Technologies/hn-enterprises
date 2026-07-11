import type { Metadata } from "next";
import { WorkProgressList } from "@/features/work-progress/components/WorkProgressList";

export const metadata: Metadata = {
  title: "Work Progress",
};

interface WorkProgressPageProps {
  searchParams?: Promise<{
    customerId?: string;
    projectId?: string;
  }>;
}

export default async function WorkProgressPage({
  searchParams,
}: WorkProgressPageProps) {
  const params = await searchParams;

  return (
    <WorkProgressList
      initialCustomerId={params?.customerId}
      initialProjectId={params?.projectId}
    />
  );
}
