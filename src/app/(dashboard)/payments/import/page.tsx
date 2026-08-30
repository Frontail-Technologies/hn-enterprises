import type { Metadata } from "next";
import { PaymentsImport } from "@/features/commercial/components/PaymentsImport";

export const metadata: Metadata = { title: "Import Payments" };

export default function Page() {
  return <PaymentsImport />;
}
