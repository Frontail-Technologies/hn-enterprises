import type { Metadata } from "next";
import { UsersImport } from "@/features/management/components/UsersImport";

export const metadata: Metadata = { title: "Import Users" };

export default function Page() {
  return <UsersImport />;
}
