import type { ComponentType } from "react";

export type ReportTemplateId =
  | "jmr-customer-consent"
  | "png-connection-job-card"
  | "testing-report-mdpe-line"
  | "pressure-observation-chart"
  | "gc-report";

export type ReportTemplateCategory = "JMR" | "Job Card" | "Testing" | "GC";

export type ReportTemplateDefinition = {
  id: ReportTemplateId;
  title: string;
  category: ReportTemplateCategory;
  description: string;
  defaultCustomerId: string;
  defaultRecordId?: string;
};

export type ReportTemplateData = {
  companyName: string;
  subtitle: string;
  client: string;
  consultant: string;
  contractor: string;
  projectName: string;
  chargeArea: string;
  location: string;
  reportNo: string;
  date: string;
  customerName: string;
  bpNo: string;
  phoneNo: string;
  customerAddress: string;
  connectionType: string;
  meterNo: string;
  meterMake: string;
  meterType: string;
  regulatorNo: string;
  regulatorMake: string;
  regulatorPressure: string;
  riserTestingPressure: string;
  riserTestingTime: string;
  meterTestingPressure: string;
  meterTestingTime: string;
  conversionDate: string;
  meterReading: string;
  remarks: string;
  giRows: PdfTableRow[];
  materialRows: PdfTableRow[];
  checklistRows: PdfTableRow[];
  pipeSummaryRows: PdfTableRow[];
  pressureRows: PdfTableRow[];
  gcChecklistRows: PdfTableRow[];
  gcEvidenceRows: PdfTableRow[];
};

export type PdfTableRow = Array<string | number | boolean | null | undefined>;

export type PdfTemplateComponent = ComponentType<{ data: ReportTemplateData }>;
