import type { ImportField } from "@/components/shared/ImportDataDialog";

export const surveyImportFields: ImportField[] = [
  { key: "customerIdentifier", label: "Customer / BP TR Number", required: true },
  { key: "project", label: "Project", required: true },
  { key: "siteArea", label: "Site / Area", required: true },
  { key: "surveyDate", label: "Survey Date", required: true },
  { key: "supervisor", label: "Supervisor", required: true },
  { key: "gpsLocation", label: "GPS Location" },
  { key: "houseType", label: "House Type" },
  { key: "connectionType", label: "Connection Type" },
  { key: "siteAccessibility", label: "Site Accessibility" },
  { key: "meterPlacement", label: "Meter Placement Possibility" },
  { key: "pipelineRoute", label: "Pipeline Route Availability" },
  { key: "civilWorkRequired", label: "Civil Work Required" },
  { key: "workableStatus", label: "Workable Status" },
  { key: "reason", label: "Reason" },
  { key: "recommendedAction", label: "Recommended Action" },
  { key: "remarks", label: "Survey Remarks" },
];
