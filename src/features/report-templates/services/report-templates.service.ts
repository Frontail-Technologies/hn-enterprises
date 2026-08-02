import { customersApi } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
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
  },
  {
    id: "png-connection-job-card",
    title: "PNG Connection Job Card",
    category: "Job Card",
    description: "Connection job card with sketch space, materials and testing details.",
  },
  {
    id: "testing-report-mdpe-line",
    title: "Testing Report MDPE Line",
    category: "Testing",
    description: "Pneumatic testing checklist, pipe size summary and result.",
  },
  {
    id: "pressure-observation-chart",
    title: "Pressure Observation Chart",
    category: "Testing",
    description: "Time-wise pressure observation readings with signature blocks.",
  },
  {
    id: "gc-report",
    title: "GC Report Template",
    category: "GC",
    description: "GC upload evidence, checklist status and reviewer remarks.",
  },
  {
    id: "pre-commissioning-report",
    title: "Pre-Commissioning Report",
    category: "Pre-Commissioning",
    description: "N2 purging, PE pipe length, valve chamber and readiness checklist report.",
  },
  {
    id: "conversion-report",
    title: "Conversion Report",
    category: "Conversion",
    description: "NG conversion report with meter, regulator, conversion date and signatures.",
  },
];

export function getReportTemplateById(id: string) {
  return reportTemplates.find((template) => template.id === id);
}

export async function resolveReportTemplateData(
  templateId: ReportTemplateId,
  customerId: string,
): Promise<ReportTemplateData> {
  const customer = await customersApi.get(customerId);
  return resolveReportTemplateDataFromCustomer(templateId, customer);
}

export function resolveReportTemplateDataFromCustomer(
  templateId: ReportTemplateId,
  customer: Customer,
): ReportTemplateData {
  const connection = customer.customerConnection;
  const commissioning = customer.commissioningConversion;

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
    date: formatPaperDate(customer.createdDate),
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
    // Pressure/JMR/GC-upload testing details no longer exist as standalone features in this app
    // (see the removed mock-report-sources.ts) - left blank rather than fabricated.
    riserTestingPressure: "-",
    riserTestingTime: "-",
    meterTestingPressure: "-",
    meterTestingTime: "-",
    conversionDate: formatPaperDate(commissioning.conversionDate),
    meterReading: commissioning.meterReading,
    remarks: customer.billingCompletion.remark || "-",
    giRows: buildGiRows(customer),
    materialRows: buildMaterialRows(customer),
    checklistRows: buildTestingChecklistRows(),
    pipeSummaryRows: buildPipeSummaryRows(customer),
    pressureRows: buildPressureRows(),
    gcChecklistRows: gcChecklistItems.map((item, index) => [index + 1, item.label, item.required ? "Required" : "Optional", "-", "-"]),
    gcEvidenceRows: gcEvidenceItems.map((item, index) => [index + 1, item.title, item.type, "-", "Pending"]),
  };
}

function selectReportNo(templateId: ReportTemplateId, gi: string, gc: string, conversion: string) {
  if (templateId === "gc-report") return gc;
  if (templateId === "pressure-observation-chart" || templateId === "testing-report-mdpe-line" || templateId === "pre-commissioning-report") return gi;
  if (templateId === "png-connection-job-card" || templateId === "conversion-report") return conversion || gi;
  return gi;
}

function buildGiRows(customer: Customer): PdfTableRow[] {
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

function buildMaterialRows(customer: Customer): PdfTableRow[] {
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

// Fixed instructional text printed on every copy of this form - not per-customer data, so it
// stays even though the actual test result (a real inspection outcome) has no data source
// anymore and is left blank below.
function buildTestingChecklistRows(): PdfTableRow[] {
  return [
    ["Flushing: Pipe cleaned from water & debris", "Yes / No / NA"],
    ["GI Sleeves / Half round concrete sleeve properly installed", "Yes / No / NA"],
    ["Isolation Valve plugged", "Yes / No / NA"],
    ["All Regulator pieces properly clamped", "Yes / No / NA"],
    ["Isolation Valve in open condition with open end plugged", "Yes / No / NA"],
    ["Videography / Photography (Real Time showing Test Pressure)", "Yes / No / NA"],
    ["Backfilling of soil done after completion of Pressure Testing", "Yes / No / NA"],
    ["Isometric Sketch showing complete length of pipeline section", "Yes / No / NA"],
    ["Result", "-"],
  ];
}

function buildPipeSummaryRows(customer: Customer): PdfTableRow[] {
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

// Pressure observation readings no longer exist as a real, standalone feature in this app - the
// form prints as a blank 12-row observation chart ready to be filled in by hand rather than
// fabricated readings.
function buildPressureRows(): PdfTableRow[] {
  const rows: PdfTableRow[] = [];
  for (let index = 1; index <= 12; index += 1) {
    rows.push([index, "", "", ""]);
  }
  return rows;
}

function formatPaperDate(value: string) {
  if (!value) return "-";
  const dateOnly = value.split(" ")[0];
  const [year, month, day] = dateOnly.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}

// Static form structure (which checklist items / evidence categories this report expects) - not
// per-customer data, so it stays as fixed template content even though the actual inspection
// status/remarks/file names (a real per-customer outcome) have no data source and are blanked
// in resolveReportTemplateDataFromCustomer above.
const gcChecklistItems: Array<{ label: string; required: boolean }> = [
  { label: "Trench depth as per approved drawing", required: true },
  { label: "Pipe bedding and warning tape laid", required: true },
  { label: "Joint fusion records available", required: true },
  { label: "Backfilling completed", required: false },
];

const gcEvidenceItems: Array<{ title: string; type: string }> = [
  { title: "Trench Photo", type: "Photo" },
  { title: "Pipe Laying Photo", type: "Photo" },
  { title: "Fusion Joint Record", type: "Document" },
];
