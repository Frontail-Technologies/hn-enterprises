import type { Metadata } from "next";
import { StaffEditPage } from "@/features/management/components/ManagementPages";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = { title: "Edit Staff" };

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <StaffEditPage id={id} />;
}
