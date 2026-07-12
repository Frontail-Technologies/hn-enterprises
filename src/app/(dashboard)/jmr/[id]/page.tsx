import type { Metadata } from "next";
import { JmrDetail } from "@/features/jmr/components/JmrPages";

export const metadata: Metadata = { title: "JMR Detail" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JmrDetail id={id} />;
}
