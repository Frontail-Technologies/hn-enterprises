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
  | "connection-remark"
  | "total-connection-remark"
  | "commissioning"
  | "valve-chamber-done"
  | "pre-commissioning-done"
  | "pole-marker-done"
  | "route-marker-done"
  | "connection-done"
  | "site-expenses-done"
  | "laying-done"
  | "flushing-testing-done"
  | "complaint-customer"
  | "customer-resolved";

export type DashboardStatRow = {
  id: string;
  customerId: string;
  bpTrNo: string;
  customerName: string;
  mobileNo: string;
  address: string;
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
    // Was mislabeled "Total Connection Remark" - this condition is actually a
    // "needs attention" workflow flag (on hold / sent back / rejected), not a
    // free-text remark. Renamed to avoid colliding with the real Total
    // Connection Remark stat below.
    title: "Needs Attention",
    helperText: "On hold, sent back or rejected",
  },
  {
    key: "total-connection-remark",
    title: "Total Connection Remark",
    // BUSINESS-CONFIRMATION-PENDING: mapped to billingCompletion.remark, the
    // closest existing field - no field is literally named "Connection
    // Remark" in the schema. See customer-completion.ts's STAT_CONDITION_SQL.
    helperText: "Customers with a connection remark on file",
  },
  {
    key: "commissioning",
    title: "Commissioning",
    helperText: "Commissioning date recorded",
  },
  {
    key: "valve-chamber-done",
    title: "Valve Chamber",
    helperText: "Valve chamber marked complete",
  },
  {
    key: "pre-commissioning-done",
    title: "Pre Commissioning",
    helperText: "Pre-commissioning marked complete",
  },
  {
    key: "pole-marker-done",
    title: "Pole Marker",
    helperText: "Pole marker marked complete",
  },
  {
    key: "route-marker-done",
    title: "Route Marker",
    helperText: "Route marker marked complete",
  },
  {
    key: "connection-done",
    title: "Total Connection Done",
    helperText: "Connection marked complete",
  },
  {
    key: "site-expenses-done",
    title: "Site Expenses Done",
    helperText: "Site expenses marked complete",
  },
  {
    key: "laying-done",
    title: "Laying",
    helperText: "All LMC pipe laying complete",
  },
  {
    key: "flushing-testing-done",
    title: "Flushing / Testing",
    helperText: "All LMC pipe testing & purging complete",
  },
  {
    key: "complaint-customer",
    title: "Complaint Customer",
    helperText: "Customers with an open or in-progress complaint",
  },
  {
    key: "customer-resolved",
    title: "Customer Resolved",
    helperText: "Had complaints, none currently unresolved",
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
  const audit = customer.completionAudit;
  const pipes = customer.lmcPipelineWork.pipeRecords;
  const complaint = customer.latestComplaint;

  return {
    id: customer.id,
    customerId: customer.id,
    bpTrNo: connection.trBpNo,
    customerName: connection.customerName,
    mobileNo: connection.mobileNo,
    address: connection.fullAddress || "-",
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
    // New progress-milestone columns - straight from the server-resolved
    // completion audit, never re-derived client-side.
    gcCompletedOn: formatDateOrDash(audit?.gcCompletedOn),
    valveChamberCompletedOn: formatDateOrDash(audit?.valveChamberCompletedOn),
    preCommissioningCompletedOn: formatDateOrDash(audit?.preCommissioningCompletedOn),
    poleMarkerCompletedOn: formatDateOrDash(audit?.poleMarkerCompletedOn),
    routeMarkerCompletedOn: formatDateOrDash(audit?.routeMarkerCompletedOn),
    connectionCompletedOn: formatDateOrDash(audit?.connectionCompletedOn),
    siteExpensesCompletedOn: formatDateOrDash(audit?.siteExpensesCompletedOn),
    commissioningDate: commissioning.commissioningDate || "-",
    // LMC laying/testing/purging - across all pipe-size records for this customer.
    layingDate: formatDateOrDash(latestDate(pipes.map((p) => p.layingDate))),
    testingDate: formatDateOrDash(latestDate(pipes.map((p) => p.testingDate))),
    purgingDate: formatDateOrDash(latestDate(pipes.map((p) => p.purgingDate))),
    pipeSummary: pipes.length ? pipes.map((p) => `${p.pipeSize}`).join(", ") : "-",
    // Complaints - only populated when this row came from the
    // complaint-customer/customer-resolved drill-down (§ backend join).
    complaintStatus: complaint?.status ?? "-",
    complaintDate: formatDateOrDash(complaint?.createdAt ?? null),
    resolvedDate: formatDateOrDash(complaint?.resolvedAt ?? null),
    resolutionRemark: complaint?.supervisorRemark || "-",
    connectionRemark: billing.remark || "-",
  };
}

function formatDateOrDash(value: string | null | undefined) {
  return value || "-";
}

function latestDate(dates: (string | null | undefined)[]) {
  const valid = dates.filter((d): d is string => Boolean(d)).sort();
  return valid.length ? valid[valid.length - 1] : null;
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
