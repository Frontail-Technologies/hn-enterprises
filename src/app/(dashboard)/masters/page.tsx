import type { Metadata } from "next";
import { MastersPage } from "@/features/management/components/MastersPage";

export const metadata: Metadata = { title: "Masters" };

export default function Page() {
  return <MastersPage />;
}
