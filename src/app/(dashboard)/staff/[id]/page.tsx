import type { Metadata } from "next";
import { StaffDetailPage } from "@/features/management/components/StaffDetailPage";

export const metadata: Metadata = { title: "Staff Details" };

export default async function StaffDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StaffDetailPage id={id} />;
}