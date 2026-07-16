import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/features/customers/components/CustomerForm";
import { findCustomerById } from "@/features/customers/services/customers.service";

export const metadata: Metadata = { title: "Edit Customer" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = findCustomerById(id);

  if (!customer) notFound();

  return <CustomerForm mode="edit" customer={customer} />;
}
