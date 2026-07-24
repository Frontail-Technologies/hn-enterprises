import type { Metadata } from "next";
import { InventoryDetailPage } from "@/features/commercial/components/InventoryDetailPage";

export const metadata: Metadata = { title: "Material Detail" };

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <InventoryDetailPage id={params.id} />;
}
