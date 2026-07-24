import type { Metadata } from "next";
import { AttendancePage } from "@/features/management/components/AttendancePage";

export const metadata: Metadata = { title: "Attendance" };

export default function Page() {
  return <AttendancePage />;
}
