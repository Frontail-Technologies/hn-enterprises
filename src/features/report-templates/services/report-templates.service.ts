import { customers, getCustomerById } from "@/features/customers/services/customers.service";
import { gcChecklistItems, gcEvidenceItems, getGcUploadById } from "@/features/gc-uploads/services/gc-uploads.service";
import { getJmrById } from "@/features/jmr/services/jmr.service";
import {
  getPressureTestById,
  pressureReadings,
} from "@/features/testing-pressure/services/testing-pressure.service";
import type {
  PdfTableRow,
  ReportTemplateData,
  ReportTemplateDefinition,
  ReportTemplateId,
} from "../types/report-template.types";

export const reportTemplates: ReportTemplateDefinition[] = [
  {
    id: "jmr-customer-consent",
    title: "JMR Sheet / Customer Consent Form",
    category: "JMR",
    description: "Customer consent, GI measurements, joint meter reading and signatures.",
    defaultCustomerId: "cust-001",
    defaultRecordId: "jmr-002",
  },
  {
    id: "png-connection-job-card",
    title: "PNG Connection Job Card",
    category: "Job Card",
    description: "Connection job card with sketch space, materials and testing details.",
    defaultCustomerId: "cust-001",
  },
  {
    id: "testing-report-mdpe-line",
    title: "Testing Report MDPE Line",
    category: "Testing",
    description: "Pneumatic testing checklist, pipe size summary and result.",
    defaultCustomerId: "cust-001",
    defaultRecordId: "tp-002",
  },
  {
    id: "pressure-observation-chart",
    title: "Pressure Observation Chart",
    category: "Testing",
    description: "Time-wise pressure observation readings with signature blocks.",
    defaultCustomerId: "cust-001",
    defaultRecordId: "tp-002",
  },
  {
    id: "gc-report",
    title: "GC Report Template",
    category: "GC",
    description: "GC upload evidence, checklist status and reviewer remarks.",
    defaultCustomerId: "cust-001",
    defaultRecordId: "gcu-002",
  },
];

export function getReportTemplateById(id: string) {
  return reportTemplates.find((template) => template.id === id);
}

export function resolveReportTemplateData(
  templateId: ReportTemplateId,
  customerId?: string,
  recordId?: string,
): ReportTemplateData {
  const template = getReportTemplateById(templateId);
  const customer = getCustomerById(customerId ?? template?.defaultCustomerId ?? customers[0].id);
  const connection = customer.customerConnection;
  const commissioning = customer.commissioningConversion;
  const pressure = getPressureTestById(recordId ?? template?.defaultRecordId ?? "tp-002");
  const jmr = getJmrById(recordId ?? template?.defaultRecordId ?? "jmr-002");
  const gcUpload = getGcUploadById(recordId ?? template?.defaultRecordId ?? "gcu-002");

  return {
    companyName: "PURBA BHARATI GAS PVT. LTD.",
    subtitle: "(A JVC of AGCL, OIL & GAIL Gas)",
    client: "PURBA BHARATI GAS PRIVATE LIMITED",
    consultant: "MECON LIMITED",
    contractor: "PRADIP KUMAR GOGOI",
    projectName: customer.projectName,
    chargeArea: customer.city,
    location: customer.siteArea,
    reportNo: selectReportNo(templateId, connection.reportNoGi, connection.reportNoGc, connection.reportNoConversion),
    date: formatPaperDate(pressure.testDate || customer.createdDate),
    customerName: connection.customerName,
    bpNo: connection.trBpNo,
    phoneNo: connection.mobileNo,
    customerAddress: connection.fullAddress,
    connectionType: connection.connectionType,
    meterNo: commissioning.meterNo,
    meterMake: "RECHEM G-1.6",
    meterType: commissioning.meterType,
    regulatorNo: commissioning.regulatorNo,
    regulatorMake: "GREENGLOB",
    regulatorPressure: commissioning.regulatorPressure,
    riserTestingPressure: pressure.pressureRange,
    riserTestingTime: pressure.duration,
    meterTestingPressure: pressure.pressureDrop,
    meterTestingTime: pressure.duration,
    conversionDate: formatPaperDate(commissioning.conversionDate),
    meterReading: commissioning.meterReading,
    remarks: resolveRemarks(templateId, customer.billingCompletion.remark, pressure.remarks, jmr.remarks, gcUpload.remarks),
    giRows: buildGiRows(customer),
    materialRows: buildMaterialRows(customer),
    checklistRows: buildTestingChecklistRows(pressure.result),
    pipeSummaryRows: buildPipeSummaryRows(customer),
    pressureRows: buildPressureRows(),
    gcChecklistRows: gcChecklistItems.map((item, index) => [
      index + 1,
      item.label,
      item.required ? "Required" : "Optional",
      item.status,
      item.remarks,
    ]),
    gcEvidenceRows: gcEvidenceItems.map((item, index) => [
      index + 1,
      item.title,
      item.type,
      item.fileName,
      item.status,
    ]),
  };
}

function selectReportNo(templateId: ReportTemplateId, gi: string, gc: string, conversion: string) {
  if (templateId === "gc-report") return gc;
  if (templateId === "pressure-observation-chart" || templateId === "testing-report-mdpe-line") return gi;
  if (templateId === "png-connection-job-card") return conversion || gi;
  return gi;
}

function resolveRemarks(templateId: ReportTemplateId, billing: string, pressure: string, jmr: string, gc: string) {
  if (templateId === "gc-report") return gc;
  if (templateId === "testing-report-mdpe-line" || templateId === "pressure-observation-chart") return pressure;
  if (templateId === "jmr-customer-consent") return jmr;
  return billing;
}

function buildGiRows(customer: ReturnType<typeof getCustomerById>): PdfTableRow[] {
  const gi = customer.giMeasurements;
  return [
    ["TF to Regulators", '1"', gi.tfToRegulator, "mtr"],
    ["GI Common Riser Length Regulator Outlet to Riser Last Point", '1"/3/4"/1/2"', "-", "mtr"],
    ["Total No. of houses that can be connected through common riser", "", "1", "nos"],
    ["GI Common Riser Length Per House", '1"/3/4"/1/2"', "-", "mtr"],
    ["GI Lateral Length For House (Tee to Meter Inlet)", '1/2"', gi.inlet, "mtr"],
    ["Total GI Length Meter Outlet to Appliance Valve", '1/2"', gi.outlet, "mtr"],
    ["Total GI Length Per House", '1/2"', gi.totalGiPipeHalfInch, "mtr"],
    ["Extra GI Length (if any beyond 15 mtr)", '1"/3/4"/1/2"', customer.fittingsAccessories.extraGiAbove10Metres, "mtr"],
    ["Prevailing Rate of Extra GI including GST @18% (Rs./M)", '1"/3/4"/1/2"', "450.25", "Rs."],
    ["Amount Payable for Extra GI including GST @18%", "", "-", "Rs."],
  ];
}

function buildMaterialRows(customer: ReturnType<typeof getCustomerById>): PdfTableRow[] {
  const gi = customer.giMeasurements;
  const valves = customer.valvesRegulators;
  const fittings = customer.fittingsAccessories;
  return [
    [1, "GI PIPE", '1/2"', "MTR", gi.totalGiPipeHalfInch],
    [2, "GI PIPE", '3/4"', "MTR", gi.giPipeThreeQuarterInch],
    [3, "TOTAL GI PIPE", '1/2" + 3/4"', "MTR", gi.totalGiPipeHalfInch],
    [4, "ISOLATION VALVE", '1/2"', "NOS", valves.isolationValveHalfInch],
    [5, "ISOLATION VALVE", '3/4"', "NOS", valves.isolationValveThreeQuarterInch],
    [6, "APPLIANCE VALVE", '1/2"', "NOS", valves.applianceValveHalfInch],
    [7, "REGULATOR", "6BAR-21MBAR", "NOS", valves.regulator6BarTo21Mbar],
    [8, "WARNING PLATE", "3MM", "NOS", valves.warningPlate],
    [9, "ELBOW", '1/2"', "NOS", fittings.elbowHalfInch],
    [10, "TEE", '1/2"', "NOS", fittings.teeHalfInch],
  ];
}

function buildTestingChecklistRows(result: string): PdfTableRow[] {
  return [
    ["Flushing: Pipe cleaned from water & debris", "Yes / No / NA"],
    ["GI Sleeves / Half round concrete sleeve properly installed", "Yes / No / NA"],
    ["Isolation Valve plugged", "Yes / No / NA"],
    ["All Regulator pieces properly clamped", "Yes / No / NA"],
    ["Isolation Valve in open condition with open end plugged", "Yes / No / NA"],
    ["Videography / Photography (Real Time showing Test Pressure)", "Yes / No / NA"],
    ["Backfilling of soil done after completion of Pressure Testing", "Yes / No / NA"],
    ["Isometric Sketch showing complete length of pipeline section", "Yes / No / NA"],
    ["Result", result || "-"],
  ];
}

function buildPipeSummaryRows(customer: ReturnType<typeof getCustomerById>): PdfTableRow[] {
  return customer.lmcPipelineWork.pipeRecords
    .filter((pipe) => pipe.pipeSize !== "Other")
    .map((pipe, index) => [
      index + 1,
      pipe.pipeSize,
      pipe.lengthMetres,
      pipe.testingStatus,
      pipe.purgingStatus,
    ]);
}

function buildPressureRows(): PdfTableRow[] {
  const baseRows = pressureReadings.map((reading, index) => [
    index + 1,
    formatPaperDate("2025-02-18"),
    reading.time,
    reading.pressure,
  ]);

  while (baseRows.length < 12) {
    const next = baseRows.length + 1;
    baseRows.push([next, "", "", ""]);
  }

  return baseRows;
}

function formatPaperDate(value: string) {
  if (!value) return "-";
  const dateOnly = value.split(" ")[0];
  const [year, month, day] = dateOnly.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}
