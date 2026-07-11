import type { Metadata } from "next";
import { CustomerDetail } from "@/features/customers/components/CustomerDetail";
import { getCustomerById } from "@/features/customers/services/customers.service";

export const metadata: Metadata = { title: "Customer Detail" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetail customer={getCustomerById(id)} />;
}
