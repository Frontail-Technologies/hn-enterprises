import type { Metadata } from "next";
import { ReportsHubPage } from "@/features/reports/components/ReportsHubPage";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsHubPage />;
}
