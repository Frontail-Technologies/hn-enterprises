import type { Metadata } from "next";
import { SurveyApproval } from "@/features/surveys/components/SurveyApproval";
import { getSurveyById } from "@/features/surveys/services/surveys.service";

export const metadata: Metadata = { title: "Survey Approval" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SurveyApproval survey={getSurveyById(id)} />;
}
