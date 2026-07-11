import type { Metadata } from "next";
import { SurveyForm } from "@/features/surveys/components/SurveyForm";
import { getSurveyById } from "@/features/surveys/services/surveys.service";

export const metadata: Metadata = { title: "Edit Survey" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SurveyForm mode="edit" survey={getSurveyById(id)} />;
}
