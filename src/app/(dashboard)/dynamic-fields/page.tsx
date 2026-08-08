import type { Metadata } from "next";
import { DynamicFieldsPage } from "@/features/dynamic-fields/components/DynamicFieldsPage";

export const metadata: Metadata = { title: "Dynamic Fields" };

export default function Page() {
  return <DynamicFieldsPage />;
}
