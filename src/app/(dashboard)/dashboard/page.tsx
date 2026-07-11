import type { Metadata } from "next";
import { DashboardContent } from "@/features/dashboard/components/DashboardContent";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardContent />;
}
