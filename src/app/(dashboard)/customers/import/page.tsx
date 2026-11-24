import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoading } from "@/components/shared/PageLoading";
import { CustomerImport } from "@/features/customers/components/CustomerImport";

export const metadata: Metadata = { title: "Import Customers" };

export default function Page() {
  // CustomerImport reads ?projectId= (import from a project page).
  return (
    <Suspense fallback={<PageLoading />}>
      <CustomerImport />
    </Suspense>
  );
}
