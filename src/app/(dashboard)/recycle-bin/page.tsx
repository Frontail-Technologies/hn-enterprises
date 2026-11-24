import type { Metadata } from "next";
import { RecycleBinPage } from "@/features/recycle-bin/RecycleBinPage";

export const metadata: Metadata = { title: "Recycle Bin" };

export default function Page() {
  return <RecycleBinPage />;
}
