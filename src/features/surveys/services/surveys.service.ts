import type {
  SubmissionStatus,
  Survey,
  SurveyActivity,
  SurveyPhoto,
  SurveyRevision,
  WorkableStatus,
} from "../types/survey.types";
import { customers } from "@/features/customers/services/customers.service";

export const workableStatusOptions: WorkableStatus[] = [
  "Workable",
  "Partially Workable",
  "Not Workable",
];

export const submissionStatusOptions: SubmissionStatus[] = [
  "Draft",
  "Submitted",
  "In Review",
  "Approved",
  "Sent Back",
  "Rejected",
];

export const surveys: Survey[] = customers.flatMap((customer) => {
  if (!customer.survey) return [];

  const survey = customer.survey;
  return [{
    id: survey.id,
    surveyId: survey.surveyId,
    customerId: customer.id,
    customerName: customer.customerConnection.customerName,
    mobileNumber: customer.customerConnection.mobileNo,
    bpTrNumber: customer.customerConnection.trBpNo,
    projectId: customer.projectId,
    projectName: customer.projectName,
    siteArea: customer.siteArea,
    supervisor: customer.customerConnection.supervisorName,
    submittedBy: survey.submittedBy,
    surveyDate: survey.surveyDate,
    submissionDate: survey.submissionDate,
    workableStatus: survey.workableStatus,
    submissionStatus: survey.approvalStatus,
    fullAddress: customer.customerConnection.fullAddress,
    latitude: survey.latitude,
    longitude: survey.longitude,
    captureAccuracy: survey.captureAccuracy,
    houseType: customer.customerConnection.houseType,
    connectionType: customer.customerConnection.connectionType,
    siteAccessibility: survey.siteAccessibility,
    meterPlacement: survey.meterPlacement,
    pipelineRoute: survey.pipelineRoute,
    civilWorkRequired: survey.civilWorkRequired,
    obstructionDetails: survey.obstaclesRemarks,
    notes: survey.notes,
    reason: survey.reason,
    recommendedAction: survey.recommendedAction,
    expectedResolutionDate: survey.expectedResolutionDate,
    remarks: survey.obstaclesRemarks,
    approvalComments: survey.approvalComments,
    photoCount: survey.photos.length,
  }];
});

export const surveyPhotos: SurveyPhoto[] = customers[0]?.survey?.photos ?? [];

export const surveyActivity: SurveyActivity[] = [
  {
    id: "activity-1",
    title: "Survey created",
    actor: "Vikas Saini",
    dateTime: "2025-01-28 10:20",
    description: "Survey draft was created from field visit.",
  },
  {
    id: "activity-2",
    title: "Photos uploaded",
    actor: "Vikas Saini",
    dateTime: "2025-01-28 15:55",
    description: "Site front, meter location and route photos were added.",
  },
  {
    id: "activity-3",
    title: "Submitted for approval",
    actor: "Vikas Saini",
    dateTime: "2025-01-28 16:40",
    description: "Survey was submitted to supervisor.",
  },
];

export const surveyRevisions: SurveyRevision[] = customers[1]?.survey?.revisions ?? [];

export function getSurveyById(id: string) {
  return surveys.find((survey) => survey.id === id) ?? surveys[0];
}

export const surveyProjectOptions = Array.from(
  new Map(surveys.map((survey) => [survey.projectId, survey.projectName])),
).map(([value, label]) => ({ value, label }));

export const surveySiteOptions = Array.from(new Set(surveys.map((survey) => survey.siteArea)));
export const surveySupervisorOptions = Array.from(
  new Set(surveys.map((survey) => survey.supervisor)),
);
