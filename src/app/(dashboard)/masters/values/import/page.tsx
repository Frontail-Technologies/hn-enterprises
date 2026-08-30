import type { Metadata } from "next";
import { MasterValuesImport } from "@/features/management/components/MasterValuesImport";

export const metadata: Metadata = { title: "Import Master Values" };

export default function Page() {
  return <MasterValuesImport />;
}
