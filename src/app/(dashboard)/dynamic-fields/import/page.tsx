import type { Metadata } from "next";
import { DynamicFieldsImport } from "@/features/dynamic-fields/components/DynamicFieldsImport";

export const metadata: Metadata = { title: "Import Custom Fields" };

export default function Page() {
  return <DynamicFieldsImport />;
}
