import type { Metadata } from "next";
import { TestingPressureList } from "@/features/testing-pressure/components/TestingPressurePages";

export const metadata: Metadata = { title: "Testing / Pressure Observation" };

export default function Page() {
  return <TestingPressureList />;
}
