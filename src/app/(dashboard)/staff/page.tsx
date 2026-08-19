import type { Metadata } from "next";
import { StaffResourcesPage } from "@/features/management/components/StaffResourcesPage";

export const metadata: Metadata = { title: "Supervisors" };

export default function Page() {
  return <StaffResourcesPage />;
}
