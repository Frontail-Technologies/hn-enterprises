import type { Metadata } from "next";
import { AnnouncementsPage } from "@/features/announcements/components/AnnouncementsPage";

export const metadata: Metadata = { title: "Announcements" };

export default function Page() {
  return <AnnouncementsPage />;
}
