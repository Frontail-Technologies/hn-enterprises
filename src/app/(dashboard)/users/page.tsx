import type { Metadata } from "next";
import { UsersRolesPage } from "@/features/management/components/UsersRolesPage";

export const metadata: Metadata = { title: "Users & Roles" };

export default function Page() {
  return <UsersRolesPage />;
}
