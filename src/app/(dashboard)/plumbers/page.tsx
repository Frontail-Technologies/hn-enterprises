import type { Metadata } from "next";
import { PlumbersPage } from "@/features/plumbers/components/PlumbersPage";

export const metadata: Metadata = { title: "Plumbers" };

export default function Page() {
  return <PlumbersPage />;
}
