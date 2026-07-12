import type { Metadata } from "next";
import { TestingPressureDetail } from "@/features/testing-pressure/components/TestingPressurePages";

export const metadata: Metadata = { title: "Pressure Test Detail" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TestingPressureDetail id={id} />;
}
