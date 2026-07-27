import type { Metadata } from "next";
import { RecentActivityPage } from "@/features/dashboard/components/RecentActivityPage";

export const metadata: Metadata = { title: "Recent Activity" };

export default function Page() {
  return <RecentActivityPage />;
}
