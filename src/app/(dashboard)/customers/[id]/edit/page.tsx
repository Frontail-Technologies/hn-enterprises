import type { Metadata } from "next";
import { CustomerForm } from "@/features/customers/components/CustomerForm";
import { getCustomerById } from "@/features/customers/services/customers.service";

export const metadata: Metadata = { title: "Edit Customer" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerForm mode="edit" customer={getCustomerById(id)} />;
}
