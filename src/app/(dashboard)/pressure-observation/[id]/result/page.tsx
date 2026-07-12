import type { Metadata } from "next";
import { PressureResultUpload } from "@/features/testing-pressure/components/TestingPressurePages";

export const metadata: Metadata = { title: "Pressure Result + Evidence" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PressureResultUpload id={id} />;
}
