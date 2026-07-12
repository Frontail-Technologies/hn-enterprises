import type { Metadata } from "next";
import { DocumentsPage } from "@/features/management/components/ManagementPages";

export const metadata: Metadata = { title: "Documents" };

export default function Page() {
  return <DocumentsPage />;
}
