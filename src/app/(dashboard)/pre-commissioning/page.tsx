import type { Metadata } from "next";
import { PreCommissioningList } from "@/features/pre-commissioning/components/PreCommissioningList";

export const metadata: Metadata = {
  title: "Pre-Commissioning",
};

export default function PreCommissioningPage() {
  return <PreCommissioningList />;
}
