import type { Metadata } from "next";
import { ReportTemplatesPage } from "@/features/report-templates/components/ReportTemplatesPage";

export const metadata: Metadata = { title: "Report Templates" };

export default function Page() {
  return <ReportTemplatesPage />;
}
