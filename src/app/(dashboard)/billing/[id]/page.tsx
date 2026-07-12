import type { Metadata } from "next";
import { BillingDetailPage } from "@/features/commercial/components/CommercialPages";

export const metadata: Metadata = { title: "Billing Detail" };

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <BillingDetailPage id={params.id} />;
}
