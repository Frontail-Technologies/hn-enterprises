import type { Metadata } from "next";
import { GcUploadDetail } from "@/features/gc-uploads/components/GcUploadDetail";
import { getGcUploadById } from "@/features/gc-uploads/services/gc-uploads.service";

export const metadata: Metadata = {
  title: "GC Upload Detail",
};

interface GcUploadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GcUploadDetailPage({ params }: GcUploadDetailPageProps) {
  const { id } = await params;
  const record = getGcUploadById(id);

  return <GcUploadDetail record={record} />;
}
