import type { Metadata } from "next";
import { GcUploadsList } from "@/features/gc-uploads/components/GcUploadsList";

export const metadata: Metadata = {
  title: "GC Uploads",
};

export default function GcUploadsPage() {
  return <GcUploadsList />;
}
