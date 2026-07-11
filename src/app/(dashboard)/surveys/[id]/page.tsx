import type { Metadata } from "next";
import { SurveyDetail } from "@/features/surveys/components/SurveyDetail";
import { getSurveyById } from "@/features/surveys/services/surveys.service";

export const metadata: Metadata = { title: "Survey Detail" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SurveyDetail survey={getSurveyById(id)} />;
}
