import type { Metadata } from "next";
import { JmrList } from "@/features/jmr/components/JmrPages";

export const metadata: Metadata = { title: "JMR & Field Reports" };

export default function Page() {
  return <JmrList />;
}
