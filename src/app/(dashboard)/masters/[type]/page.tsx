import { notFound } from "next/navigation";
import { mastersService } from "@/features/masters/services/masters.service";
import { MasterDetailClient } from "@/features/masters/components/MasterDetailClient";

interface Props {
  params: { type: string };
}

export async function generateMetadata({ params }: Props) {
  const config = mastersService.getConfig(params.type);
  return { title: config ? `${config.title} — Masters` : "Not Found" };
}

export default async function MasterDetailPage({ params }: Props) {
  const config = mastersService.getConfig(params.type);
  if (!config) notFound();

  const records = await mastersService.getRecords(params.type);

  return <MasterDetailClient config={config} initialRecords={records} />;
}
