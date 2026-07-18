import type { Metadata } from "next";
import { CustomerImport } from "@/features/customers/components/CustomerImport";

export const metadata: Metadata = { title: "Import Customers" };

export default function Page() {
  return <CustomerImport />;
}
