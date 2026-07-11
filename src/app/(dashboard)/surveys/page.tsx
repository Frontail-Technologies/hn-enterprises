import type { Metadata } from "next";
import { SurveysList } from "@/features/surveys/components/SurveysList";

export const metadata: Metadata = { title: "Surveys" };

export default function Page() {
  return <SurveysList />;
}
