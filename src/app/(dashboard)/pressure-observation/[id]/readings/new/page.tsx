import type { Metadata } from "next";
import { PressureReadingForm } from "@/features/testing-pressure/components/TestingPressurePages";

export const metadata: Metadata = { title: "Add Pressure Readings" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PressureReadingForm id={id} mode="add" />;
}
