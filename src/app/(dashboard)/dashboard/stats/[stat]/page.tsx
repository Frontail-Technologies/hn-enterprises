import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardStatDetailPage } from "@/features/dashboard/components/DashboardStatDetailPage";
import {
  isDashboardStatKey,
  getDashboardStatDefinition,
} from "@/features/dashboard/services/dashboard-stats.service";

type PageProps = {
  params: Promise<{ stat: string }>;
  searchParams?: Promise<{ projectId?: string; city?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { stat } = await params;
  if (!isDashboardStatKey(stat)) return { title: "Dashboard Stat" };
  return { title: getDashboardStatDefinition(stat).title };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { stat } = await params;
  const query = await searchParams;
  if (!isDashboardStatKey(stat)) notFound();

  return (
    <DashboardStatDetailPage
      statKey={stat}
      projectId={query?.projectId}
      city={query?.city}
    />
  );
}
