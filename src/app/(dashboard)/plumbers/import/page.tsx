import type { Metadata } from "next";
import { PlumbersImport } from "@/features/plumbers/components/PlumbersImport";

export const metadata: Metadata = { title: "Import Plumbers" };

export default function Page() {
  return <PlumbersImport />;
}
