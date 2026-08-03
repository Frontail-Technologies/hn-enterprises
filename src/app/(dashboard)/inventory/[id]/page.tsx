import type { Metadata } from "next";
import { InventoryDetailPage } from "@/features/commercial/components/InventoryDetailPage";

export const metadata: Metadata = { title: "Material Detail" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <InventoryDetailPage id={id} />;
}
