import type { Metadata } from "next";
import { PlanningPage } from "@/features/planning/components/PlanningPage";

export const metadata: Metadata = { title: "Planning & DPR" };

export default function Page() {
  return <PlanningPage />;
}
