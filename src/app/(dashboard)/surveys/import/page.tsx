import type { Metadata } from "next";
import { SurveyImport } from "@/features/surveys/components/SurveyImport";

export const metadata: Metadata = { title: "Import Surveys" };

export default function Page() {
  return <SurveyImport />;
}
