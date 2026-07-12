import type { Metadata } from "next";
import { InventoryDetailPage } from "@/features/commercial/components/CommercialPages";

export const metadata: Metadata = { title: "Material Detail" };

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <InventoryDetailPage id={params.id} />;
}
