import type { Metadata } from "next";
import { SurveyForm } from "@/features/surveys/components/SurveyForm";

export const metadata: Metadata = { title: "New Survey" };

export default function Page() {
  return <SurveyForm mode="create" />;
}
