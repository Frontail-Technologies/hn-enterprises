import type { Metadata } from "next";
import { GcUploadEdit } from "@/features/gc-uploads/components/GcUploadEdit";
import { getGcUploadById } from "@/features/gc-uploads/services/gc-uploads.service";

export const metadata: Metadata = {
  title: "Edit GC Upload",
};

interface GcUploadEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function GcUploadEditPage({ params }: GcUploadEditPageProps) {
  const { id } = await params;
  const record = getGcUploadById(id);

  return <GcUploadEdit record={record} />;
}
