import type { Metadata } from "next";
import { CustomersList } from "@/features/customers/components/CustomersList";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return <CustomersList />;
}
