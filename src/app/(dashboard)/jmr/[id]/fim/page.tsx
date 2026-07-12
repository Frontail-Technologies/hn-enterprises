import type { Metadata } from "next";
import { JmrUploadPage } from "@/features/jmr/components/JmrPages";

export const metadata: Metadata = { title: "FIM Upload" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JmrUploadPage id={id} uploadType="FIM" />;
}
