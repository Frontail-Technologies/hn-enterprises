import type { Metadata } from "next";
import { MaterialsImport } from "@/features/commercial/components/MaterialsImport";

export const metadata: Metadata = { title: "Import Materials" };

export default function Page() {
  return <MaterialsImport />;
}
