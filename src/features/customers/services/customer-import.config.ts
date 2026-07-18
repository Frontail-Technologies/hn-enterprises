import type { ImportField } from "@/components/shared/ImportDataDialog";
import {
  lmcPipeRecordFields,
  lmcPipeSizeOptions,
  lmcPipelineFields,
  mdpeFittingFields,
} from "./customers.service";

export const customerImportFields: ImportField[] = [
  { key: "customerName", label: "Customer Name", required: true },
  { key: "mobileNumber", label: "Mobile Number", required: true },
  { key: "fullAddress", label: "Full Address", required: true },
  { key: "project", label: "Project", required: true },
  { key: "siteArea", label: "Site / Area", required: true },
  { key: "bpTrNumber", label: "BP / TR Number", required: true },
  { key: "connectionType", label: "Connection Type", required: true },
  { key: "gpsLocation", label: "GPS Location" },
  { key: "houseType", label: "House Type" },
  { key: "scheme", label: "Scheme" },
  { key: "paymentStatus", label: "Connection Payment Status" },
  { key: "paymentMode", label: "Payment Mode" },
  { key: "initialAmount", label: "Initial Amount" },
  { key: "supervisor", label: "Supervisor" },
  { key: "plumberGroup", label: "Plumber / Group" },
  { key: "fieldExecutive", label: "Field Executive" },
  { key: "meterNumber", label: "Meter Number" },
  { key: "meterType", label: "Meter Type" },
  { key: "regulatorNumber", label: "Regulator Number" },
  { key: "regulatorPressure", label: "Regulator Pressure" },
  ...lmcPipeSizeOptions.flatMap((pipeSize) =>
    lmcPipeRecordFields.map((field) => ({
      key: `lmc.${pipeSize}.${String(field.key)}`,
      label: `${pipeSize} Pipe - ${field.label}`,
    })),
  ),
  ...lmcPipelineFields.map((field) => ({ key: String(field.key), label: field.label })),
  ...mdpeFittingFields.map((field) => ({ key: String(field.key), label: field.label })),
];
