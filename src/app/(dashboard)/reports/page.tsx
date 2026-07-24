import type { Metadata } from "next";
import { ReportsPage } from "@/features/management/components/ReportsPage";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsPage />;
}
