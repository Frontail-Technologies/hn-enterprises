import type { Metadata } from "next";
import { ReportsPage } from "@/features/management/components/ManagementPages";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsPage />;
}
