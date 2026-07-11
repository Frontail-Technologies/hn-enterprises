import type { Metadata } from "next";
import { CustomerForm } from "@/features/customers/components/CustomerForm";

export const metadata: Metadata = { title: "Create Customer" };

export default function Page() {
  return <CustomerForm mode="create" />;
}
