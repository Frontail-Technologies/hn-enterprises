"use client";

import { Button } from "@/components/ui/button";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/format";
import { SectionStatusBadge } from "./SectionCompletionActions";
import type { CustomerSurvey, CustomerSurveyRevision, SectionCompletionResult } from "../../types/customer.types";

export function CustomerSurveyDetail({ survey, completion }: { survey?: CustomerSurvey; completion?: SectionCompletionResult }) {
  if (!survey) {
    return (
      <SectionCard
        title="Survey"
        action={
          <Button type="button" variant="outline" size="sm">
            Create Survey
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          No survey record is available for this customer yet.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Survey Details"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <SectionStatusBadge result={completion} />
            <Button type="button" variant="outline" size="sm">
              Edit
            </Button>
            <Button type="button" variant="outline" size="sm">
              Submit
            </Button>
            <Button type="button" size="sm">
              Resubmit
            </Button>
          </div>
        }
      >
        <KeyValueGrid
          columns={3}
          items={[
            { label: "Survey ID", value: survey.surveyId },
            { label: "Survey Date", value: formatDate(survey.surveyDate) },
            { label: "Assigned Surveyor", value: survey.assignedSurveyor },
            { label: "GPS / Location", value: `${survey.latitude}, ${survey.longitude}` },
            { label: "Capture Accuracy", value: survey.captureAccuracy },
            { label: "Workable Status", value: <StatusBadge status={survey.workableStatus} /> },
            { label: "Approval Status", value: <StatusBadge status={survey.approvalStatus} /> },
            { label: "Submitted By", value: survey.submittedBy || "-" },
            { label: "Submitted On", value: formatDateTime(survey.submissionDate) },
          ]}
        />
      </SectionCard>

      <SectionCard title="Initial Measurements">
        <p className="text-sm font-medium text-foreground">{survey.initialMeasurements || "-"}</p>
        <div className="mt-3">
          <KeyValueGrid
            columns={3}
            items={[
              { label: "Site Accessibility", value: <StatusBadge status={survey.siteAccessibility} /> },
              { label: "Meter Placement", value: <StatusBadge status={survey.meterPlacement} /> },
              { label: "Pipeline Route", value: <StatusBadge status={survey.pipelineRoute} /> },
              { label: "Civil Work Required", value: survey.civilWorkRequired },
              { label: "Reason", value: survey.reason || "-" },
              { label: "Expected Resolution", value: formatDate(survey.expectedResolutionDate) },
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="Obstacles / Remarks">
        <KeyValueGrid
          columns={2}
          items={[
            { label: "Obstacles", value: survey.obstaclesRemarks || "-" },
            { label: "Recommended Action", value: survey.recommendedAction || "-" },
            { label: "Survey Notes", value: survey.notes || "-" },
            { label: "Approval Comments", value: survey.approvalComments || "-" },
          ]}
        />
      </SectionCard>

      <SectionCard title="Revision History">
        <SurveyRevisionHistory revisions={survey.revisions} />
      </SectionCard>
    </div>
  );
}

function SurveyRevisionHistory({ revisions }: { revisions: CustomerSurveyRevision[] }) {
  if (!revisions.length) {
    return <p className="text-sm text-muted-foreground">No revisions yet.</p>;
  }

  return (
    <div className="space-y-2">
      {revisions.map((revision) => (
        <div key={revision.id} className="rounded-lg border border-border/70 bg-background px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{revision.revisionNumber}</p>
            <StatusBadge status={revision.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {revision.submittedBy} - {formatDate(revision.date)}
          </p>
          <p className="mt-1 text-xs font-medium text-foreground">{revision.notes}</p>
        </div>
      ))}
    </div>
  );
}
