import type { Metadata } from "next";
import { JmrPreviewPage } from "@/features/jmr/components/JmrPages";

export const metadata: Metadata = { title: "Meter Photo / PDF Preview" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JmrPreviewPage id={id} />;
}
