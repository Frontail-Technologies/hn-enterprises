import type { Metadata } from "next";
import { ComplaintsPage } from "@/features/complaints/components/ComplaintsPage";

export const metadata: Metadata = { title: "Complaints" };

export default function Page() {
  return <ComplaintsPage />;
}
