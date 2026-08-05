import type { Customer } from "@/features/customers/types/customer.types";
import { deriveLmcPipeCurrentStage } from "@/features/customers/services/customers.service";

export type DashboardStatKey =
  | "total-customers"
  | "survey-done"
  | "gi-done"
  | "gc-done"
  | "conversion-done"
  | "jmr-done"
  | "gi-bill-done"
  | "gc-bill-done"
  | "conversion-bill-done"
  | "total-pbg-assignment"
  | "connection-remark";

export type DashboardStatRow = {
  id: string;
  customerId: string;
  bpTrNo: string;
  customerName: string;
  mobileNo: string;
  projectName: string;
  siteArea: string;
  supervisor: string;
  status: string;
  [key: string]: string;
};

export type DashboardStatDefinition = {
  key: DashboardStatKey;
  title: string;
  helperText: string;
};

export const dashboardStatDefinitions: DashboardStatDefinition[] = [
  {
    key: "total-customers",
    title: "Total Customers",
    helperText: "Customer master records",
  },
  {
    key: "survey-done",
    title: "Survey Done",
    helperText: "Survey records available",
  },
  {
    key: "gi-done",
    title: "GI Done",
    helperText: "GI installation/report completed",
  },
  {
    key: "gc-done",
    title: "GC Done",
    helperText: "GC report/evidence completed",
  },
  {
    key: "conversion-done",
    title: "Conversion Done",
    helperText: "Conversion date available",
  },
  {
    key: "jmr-done",
    title: "JMR Done",
    helperText: "JMR marked as done",
  },
  {
    key: "gi-bill-done",
    title: "GI Bill Done",
    helperText: "GI invoice completed",
  },
  {
    key: "gc-bill-done",
    title: "GC Bill Done",
    helperText: "GC invoice completed",
  },
  {
    key: "conversion-bill-done",
    title: "Conversion Bill Done",
    helperText: "Conversion invoice completed",
  },

  {
    key: "total-pbg-assignment",
    title: "Total PBG Assignment",
    helperText: "JMR submitted in PBG",
  },
  {
    key: "connection-remark",
    title: "Total Connection Remark",
    helperText: "Sent back, rejected or on hold",
  },
];

export function isDashboardStatKey(value: string): value is DashboardStatKey {
  return dashboardStatDefinitions.some((definition) => definition.key === value);
}

export function getDashboardStatDefinition(key: DashboardStatKey) {
  return dashboardStatDefinitions.find((definition) => definition.key === key)!;
}

export function getDashboardStatRows(key: DashboardStatKey, source: Customer[]): DashboardStatRow[] {
  return source.map((customer) => buildRow(customer, key));
}

export function getDashboardStatValue(key: DashboardStatKey, source: Customer[]) {
  const total = source.length;
  const rows = getDashboardStatRows(key, source);



  if (key === "total-customers") return String(total);
  return `${rows.length}/${total}`;
}

function matchesStat(customer: Customer, key: DashboardStatKey) {
  const connection = customer.customerConnection;
  const commissioning = customer.commissioningConversion;
  const billing = customer.billingCompletion;

  if (key === "total-customers") return true;
  if (key === "survey-done") return Boolean(customer.survey?.surveyDate);
  if (key === "gi-done") return Boolean(commissioning.installationDate);
  if (key === "gc-done") return Boolean(commissioning.commissioningDate || commissioning.meterNo);
  if (key === "conversion-done") return Boolean(commissioning.conversionDate);
  if (key === "jmr-done") return Boolean(billing.jmrDone);
  if (key === "gi-bill-done") return Boolean(billing.giBillDone);
  if (key === "gc-bill-done") return Boolean(billing.gcBillDone);
  if (key === "conversion-bill-done") return Boolean(billing.conversionBillDone);

  if (key === "total-pbg-assignment") {
    return Boolean(billing.jmrSubmittedInPbg);
  }
  if (key === "connection-remark") {
    return (
      customer.status === "On Hold" ||
      customer.survey?.approvalStatus === "Sent Back" ||
      customer.survey?.approvalStatus === "Rejected" ||
      customer.lmcPipelineWork.pipeRecords.some((pipe) => deriveLmcPipeCurrentStage(pipe) === "On Hold")
    );
  }

  return false;
}

function buildRow(customer: Customer, key: DashboardStatKey): DashboardStatRow {
  const connection = customer.customerConnection;
  const survey = customer.survey;
  const commissioning = customer.commissioningConversion;
  const billing = customer.billingCompletion;
  const giTotal =
    customer.giMeasurements.totalGiPipeHalfInch ||
    customer.giMeasurements.giPipeThreeQuarterInch ||
    customer.giMeasurements.giPipeOneInch ||
    "-";
  const gcDocument = customer.documents.find((document) => document.category === "GC Report");
  const onHoldPipe = customer.lmcPipelineWork.pipeRecords.find(
    (pipe) => deriveLmcPipeCurrentStage(pipe) === "On Hold",
  );

  return {
    id: customer.id,
    customerId: customer.id,
    bpTrNo: connection.trBpNo,
    customerName: connection.customerName,
    mobileNo: connection.mobileNo,
    projectName: customer.projectName,
    siteArea: customer.siteArea,
    supervisor: connection.supervisorName,
    status: customer.status,
    city: customer.city,
    connectionType: connection.connectionType,
    surveyId: survey?.surveyId ?? "-",
    surveyDate: survey?.surveyDate ?? "-",
    surveyor: survey?.assignedSurveyor ?? "-",
    workableStatus: survey?.workableStatus ?? "-",
    approvalStatus: survey?.approvalStatus ?? "-",
    giDate: commissioning.installationDate || "-",
    totalGi: giTotal,
    giReportNo: connection.reportNoGi || "-",
    gcReportNo: connection.reportNoGc || gcDocument?.referenceNumber || "-",
    gcStatus: gcDocument?.status ?? (connection.reportNoGc ? "Completed" : "-"),
    conversionDate: commissioning.conversionDate || "-",
    meterNo: commissioning.meterNo || "-",
    regulatorNo: commissioning.regulatorNo || "-",
    meterReading: commissioning.meterReading || "-",
    jmrDone: formatBoolean(billing.jmrDone),
    jmrSubmittedInPbg: formatBoolean(billing.jmrSubmittedInPbg),
    giBillDone: formatBoolean(billing.giBillDone),
    gcBillDone: formatBoolean(billing.gcBillDone),
    conversionBillDone: formatBoolean(billing.conversionBillDone),
    billingStatus: getBillingStatus(customer),
    reworkModule: getReworkModule(customer, key),
    reworkIssue:
      survey?.approvalComments ||
      survey?.obstaclesRemarks ||
      onHoldPipe?.remarks ||
      billing.remark ||
      "-",
    assignedTo: connection.supervisorName || connection.plumberName || "-",
  };
}

function hasDocument(customer: Customer, category: string) {
  return customer.documents.some((document) => document.category === category);
}

function getBillingStatus(customer: Customer) {
  const billing = customer.billingCompletion;
  const done =
    Number(Boolean(billing.giBillDone)) +
    Number(Boolean(billing.gcBillDone)) +
    Number(Boolean(billing.conversionBillDone));
  if (done === 3) return "Completed";
  if (done > 0) return "Partial";
  return "Pending";
}

function getReworkModule(customer: Customer, key: DashboardStatKey) {
  if (key !== "connection-remark") return "-";
  if (customer.survey?.approvalStatus === "Sent Back") return "Survey";
  if (customer.survey?.approvalStatus === "Rejected") return "Survey";
  if (customer.lmcPipelineWork.pipeRecords.some((pipe) => deriveLmcPipeCurrentStage(pipe) === "On Hold")) {
    return "LMC";
  }
  if (customer.status === "On Hold") return "Customer";
  return "-";
}

function formatBoolean(value?: boolean) {
  return value ? "Yes" : "No";
}
