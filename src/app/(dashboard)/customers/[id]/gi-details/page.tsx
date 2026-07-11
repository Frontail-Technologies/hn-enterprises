import type { Metadata } from "next";
import { CustomerGiDetails } from "@/features/customers/components/CustomerGiDetails";
import { getCustomerById } from "@/features/customers/services/customers.service";

export const metadata: Metadata = { title: "Customer GI Details" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerGiDetails customer={getCustomerById(id)} />;
}
