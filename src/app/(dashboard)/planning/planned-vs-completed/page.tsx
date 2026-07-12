import type { Metadata } from "next";
import { PlanningSubPage } from "@/features/planning/components/PlanningPage";

export const metadata: Metadata = { title: "Planned vs Completed Work" };

export default function Page() {
  return <PlanningSubPage type="planned-vs-completed" />;
}
