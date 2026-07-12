import type { Metadata } from "next";
import { SettingsPage } from "@/features/management/components/ManagementPages";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsPage />;
}
