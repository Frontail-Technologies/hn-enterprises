import type { Metadata } from "next";
import { CustomerMapPage } from "@/features/map/components/CustomerMapPage";

export const metadata: Metadata = { title: "Map" };

export default function Page() {
  return <CustomerMapPage />;
}
