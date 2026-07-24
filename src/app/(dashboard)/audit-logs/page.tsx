import type { Metadata } from "next";
import { AuditLogsPage } from "@/features/management/components/AuditLogsPage";

export const metadata: Metadata = { title: "Audit Logs" };

export default function Page() {
  return <AuditLogsPage />;
}
