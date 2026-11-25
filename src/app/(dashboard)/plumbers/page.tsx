import { Suspense } from "react";
import type { Metadata } from "next";
import { PlumbersPage } from "@/features/plumbers/components/PlumbersPage";

export const metadata: Metadata = { title: "Plumbers & Labour" };

export default function Page() {
  // The Plumbers / Labour tab is read from the address (?tab=labour).
  return (
    <Suspense>
      <PlumbersPage />
    </Suspense>
  );
}
