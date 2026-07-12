import type { Metadata } from "next";
import { PlanningSubPage } from "@/features/planning/components/PlanningPage";

export const metadata: Metadata = { title: "Delay Reason + Photos" };

export default function Page() {
  return <PlanningSubPage type="delays" />;
}
