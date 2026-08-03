import type { Metadata } from "next";
import { BillingDetailPage } from "@/features/commercial/components/BillingDetailPage";

export const metadata: Metadata = { title: "Billing Detail" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <BillingDetailPage id={id} />;
}
