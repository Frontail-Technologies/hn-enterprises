import type { Metadata } from "next";
import { ApprovalsPage } from "@/features/approvals/components/ApprovalsPage";

export const metadata: Metadata = { title: "Approvals" };

export default function Page() {
  return <ApprovalsPage />;
}
