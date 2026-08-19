import type { Metadata } from "next";
import { StaffEditPage } from "@/features/management/components/StaffEditPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = { title: "Edit Supervisor" };

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <StaffEditPage id={id} />;
}
