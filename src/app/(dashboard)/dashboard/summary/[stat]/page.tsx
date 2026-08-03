import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardSummaryDetailPage } from "@/features/dashboard/components/DashboardSummaryDetailPage";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import {
  getAdminSummaryStatDefinition,
  isAdminSummaryStatKey,
} from "@/features/dashboard/services/dashboard-summary-stats.service";

type PageProps = {
  params: Promise<{ stat: string }>;
  searchParams?: Promise<{ projectId?: string; city?: string; period?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { stat } = await params;
  if (!isAdminSummaryStatKey(stat)) return { title: "Dashboard Summary" };
  return { title: getAdminSummaryStatDefinition(stat).title };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { stat } = await params;
  const query = await searchParams;
  if (!isAdminSummaryStatKey(stat)) notFound();

  return (
    <DashboardSummaryDetailPage
      statKey={stat}
      projectId={query?.projectId}
      city={query?.city}
      period={query?.period as DashboardMetricPeriod | undefined}
    />
  );
}
