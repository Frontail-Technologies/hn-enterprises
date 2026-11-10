import type { Metadata } from "next";
import { CustomersList } from "@/features/customers/components/CustomersList";

export const metadata: Metadata = { title: "Customers" };

/** `?projectId=` (and optional `?statKey=`) open the list scoped to one project, e.g. from Project detail. */
export default async function Page({ searchParams }: { searchParams: Promise<{ projectId?: string; statKey?: string }> }) {
  const { projectId, statKey } = await searchParams;
  return <CustomersList key={`${projectId ?? ""}|${statKey ?? ""}`} projectId={projectId || undefined} statKey={statKey || undefined} />;
}
