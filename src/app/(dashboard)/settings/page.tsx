import type { Metadata } from "next";
import { SettingsPage } from "@/features/management/components/SettingsPage";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsPage />;
}
