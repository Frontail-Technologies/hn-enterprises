"use client";

import type { ColumnDef } from "@/components/shared/DataTable";
import { ImportDataPage } from "@/components/shared/ImportDataPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { surveyImportFields } from "../services/survey-import.config";
import { surveys } from "../services/surveys.service";
import type { Survey } from "../types/survey.types";

export function SurveyImport() {
  const columns: ColumnDef<Survey>[] = [
    { key: "surveyId", header: "Survey ID" },
    { key: "customerName", header: "Customer" },
    { key: "bpTrNumber", header: "BP / TR Number" },
    {
      key: "projectSite",
      header: "Project / Site",
      render: (survey) => (
        <div className="min-w-44">
          <p className="font-medium text-foreground">{survey.projectName}</p>
          <p className="text-xs text-muted-foreground">{survey.siteArea}</p>
        </div>
      ),
    },
    { key: "supervisor", header: "Supervisor" },
    {
      key: "workableStatus",
      header: "Workable",
      render: (survey) => <StatusBadge status={survey.workableStatus} />,
    },
    {
      key: "submissionStatus",
      header: "Submission",
      render: (survey) => <StatusBadge status={survey.submissionStatus} />,
    },
  ];

  return (
    <ImportDataPage
      title="Import Surveys"
      moduleName="Survey"
      description="Upload survey records using the fixed survey import template, then validate customer references, locations, field responses and submission status."
      backHref="/surveys"
      backLabel="Back to Surveys"
      fields={surveyImportFields}
      previewRows={surveys}
      previewColumns={columns}
      emptyTitle="No survey rows previewed"
    />
  );
}
