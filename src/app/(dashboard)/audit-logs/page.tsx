import type { Metadata } from "next";
import { AuditLogsPage } from "@/features/management/components/ManagementPages";

export const metadata: Metadata = { title: "Audit Logs" };

export default function Page() {
  return <AuditLogsPage />;
}
