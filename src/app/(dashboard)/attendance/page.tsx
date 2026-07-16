import type { Metadata } from "next";
import { AttendancePage } from "@/features/management/components/ManagementPages";

export const metadata: Metadata = { title: "Attendance" };

export default function Page() {
  return <AttendancePage />;
}
