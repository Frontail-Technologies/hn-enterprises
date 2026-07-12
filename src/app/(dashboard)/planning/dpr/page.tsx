import type { Metadata } from "next";
import { PlanningSubPage } from "@/features/planning/components/PlanningPage";

export const metadata: Metadata = { title: "Daily Progress Report" };

export default function Page() {
  return <PlanningSubPage type="dpr" />;
}
