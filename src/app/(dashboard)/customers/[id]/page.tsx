import type { Metadata } from "next";
import { CustomerForm } from "@/features/customers/components/CustomerForm";
import { CustomerDetail } from "@/features/customers/components/CustomerDetail";

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

  if (query?.mode === "edit") {
    return <CustomerForm mode="edit" customerId={id} />;
  }

  return <CustomerDetail customerId={id} />;
}
