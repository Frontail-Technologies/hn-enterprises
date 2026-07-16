import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/features/customers/components/CustomerForm";
import { CustomerDetail } from "@/features/customers/components/CustomerDetail";
import { findCustomerById } from "@/features/customers/services/customers.service";

export const metadata: Metadata = { title: "Customer Detail" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const customer = findCustomerById(id);

  if (!customer) notFound();

  if (query?.mode === "edit") {
    return <CustomerForm mode="edit" customer={customer} />;
  }

  return <CustomerDetail customer={customer} />;
}
