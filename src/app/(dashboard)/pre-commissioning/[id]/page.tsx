import type { Metadata } from "next";
import { PreCommissioningDetail } from "@/features/pre-commissioning/components/PreCommissioningDetail";
import { getPreCommissioningById } from "@/features/pre-commissioning/services/pre-commissioning.service";

export const metadata: Metadata = {
  title: "Pre-Commissioning Detail",
};

interface PreCommissioningDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreCommissioningDetailPage({
  params,
}: PreCommissioningDetailPageProps) {
  const { id } = await params;
  const record = getPreCommissioningById(id);

  return <PreCommissioningDetail record={record} />;
}
