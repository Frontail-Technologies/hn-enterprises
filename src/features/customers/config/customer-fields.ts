import type { CustomField } from "@/features/dynamic-fields/types";
import type {
  FittingsAccessories,
  GiMeasurements,
  MdpeFittings,
  ValvesRegulators,
} from "../types/customer.types";

export type FieldDefinition<T> = {
  key: keyof T;
  label: string;
  input?: "text" | "number" | "date" | "textarea" | "select" | "boolean" | "meter";
  options?: readonly string[];
  readOnly?: boolean;
  digits?: number;
};

export const giMeasurementFields: FieldDefinition<GiMeasurements>[] = [
  { key: "tfToRegulator", label: "TF to Regulator", input: "number" },
  { key: "inlet", label: "Inlet", input: "number" },
  { key: "outlet", label: "Outlet", input: "number" },
  {
    key: "totalGiPipeHalfInch",
    label: "Total GI Pipe 1/2 inch",
    input: "number",
  },
  { key: "giPipeThreeQuarterInch", label: "GI Pipe 3/4 inch", input: "number" },
  { key: "giPipeOneInch", label: "GI Pipe 1 inch", input: "number" },
  {
    key: "giPipeOneAndHalfInch",
    label: "1.5 inch GI Pipe Measurement",
    input: "number",
  },
  {
    key: "giPipeTwoInch",
    label: "2 inch GI Pipe Measurement",
    input: "number",
  },
  {
    key: "approvalStatus",
    label: "Approval Status",
    input: "select",
    options: ["draft", "submitted", "approved", "rejected"],
  },
  { key: "approvalComments", label: "Approval Comments", input: "textarea" },
];

export const isolationValveFields: FieldDefinition<ValvesRegulators>[] = [
  {
    key: "isolationValveHalfInch",
    label: "Isolation Valve 1/2 inch",
    input: "number",
  },
  {
    key: "isolationValveThreeQuarterInch",
    label: "Isolation Valve 3/4 inch",
    input: "number",
  },
  {
    key: "isolationValveOneInch",
    label: "Isolation Valve 1 inch",
    input: "number",
  },
  {
    key: "isolationValveOneAndHalfInch",
    label: "Isolation Valve 1.5 inch",
    input: "number",
  },
  {
    key: "isolationValveTwoInch",
    label: "Isolation Valve 2 inch",
    input: "number",
  },
  {
    key: "applianceValveHalfInch",
    label: "Appliance Valve 1/2 inch",
    input: "number",
  },
  {
    key: "regulator6BarTo100Mbar",
    label: "Regulator 6 Bar-100 mBar",
    input: "number",
  },
  {
    key: "regulator6BarTo21Mbar",
    label: "Regulator 6 Bar-21 mBar",
    input: "number",
  },
  {
    key: "regulator100MbarTo21Mbar",
    label: "Regulator 100 mBar-21 mBar",
    input: "number",
  },
  { key: "warningPlate", label: "Warning Plate", input: "number" },
];

export const fittingAccessoryFields: FieldDefinition<FittingsAccessories>[] = [
  { key: "clampHalfInch", label: "Clamp 1/2 inch", input: "number" },
  {
    key: "clamp3InchToHalfInch",
    label: "Clamp 3 inch-1/2 inch",
    input: "number",
  },
  { key: "elbowHalfInch", label: "Elbow 1/2 inch", input: "number" },
  { key: "mfElbowHalfInch", label: "M/F Elbow 1/2 inch", input: "number" },
  { key: "socketHalfInch", label: "Socket 1/2 inch", input: "number" },
  { key: "teeHalfInch", label: "Tee 1/2 inch", input: "number" },
  { key: "nipple2Inch", label: "Nipple 2 inch", input: "number" },
  { key: "nipple3Inch", label: "Nipple 3 inch", input: "number" },
  { key: "nipple4Inch", label: "Nipple 4 inch", input: "number" },
  {
    key: "reducerElbowThreeQuarterToHalfInch",
    label: "Reducer Elbow 3/4 inch-1/2 inch",
    input: "number",
  },
  { key: "threeQuarterInchTo3Inch", label: "3/4 inch-3 inch", input: "number" },
  { key: "unionHalfInch", label: "Union 1/2 inch", input: "number" },
  { key: "plugHalfInch", label: "Plug 1/2 inch", input: "number" },
  {
    key: "fittingsOneAndHalfInchQuantity",
    label: "1.5 inch Fittings Quantity",
    input: "number",
  },
  {
    key: "fittingsTwoInchQuantity",
    label: "2 inch Fittings Quantity",
    input: "number",
  },
  {
    key: "extraGiAbove10Metres",
    label: "Extra GI Above 10 Metres",
    input: "number",
  },
];

export const mdpeFittingFields: FieldDefinition<MdpeFittings>[] = [
  { key: "saddle90To32Mm", label: "Saddle 90-32 mm", input: "number" },
  { key: "saddle90Mm", label: "90 mm Saddle", input: "number" },
  { key: "saddle63To32Mm", label: "Saddle 63-32 mm", input: "number" },
  { key: "saddle32To20Mm", label: "Saddle 32-20 mm", input: "number" },
  { key: "tee90Mm", label: "90 mm Tee", input: "number" },
  { key: "tee32Mm", label: "Tee 32 mm", input: "number" },
  { key: "tee20Mm", label: "Tee 20 mm", input: "number" },
  {
    key: "reducerCoupler90To63Mm",
    label: "90-63 mm Reducer Coupler",
    input: "number",
  },
  {
    key: "reducerCoupler63To32Mm",
    label: "Reducer Coupler 63-32 mm",
    input: "number",
  },
  {
    key: "reducerCoupler32To20Mm",
    label: "Reducer Coupler 32-20 mm",
    input: "number",
  },
  { key: "coupler90Mm", label: "90 mm Coupler", input: "number" },
  { key: "coupler32Mm", label: "Coupler 32 mm", input: "number" },
  { key: "coupler20Mm", label: "Coupler 20 mm", input: "number" },
  { key: "endCap90Mm", label: "90 mm End Cap", input: "number" },
];

/**
 * The single conversion path from a dynamic `CustomField[]` definition to the
 * editable `FieldDefinition<Record<string, string | boolean>>[]` shape consumed
 * by the shared field renderer. Used by the customer form's per-group custom
 * field tabs; the read-only detail projection uses its own display-formatting
 * contract (`formatDynamicFieldValue`) and is intentionally not unified here.
 */
export function customFieldsToFieldDefinitions(
  fields: CustomField[],
  options: { isAdmin: boolean },
): FieldDefinition<Record<string, string | boolean>>[] {
  return fields.map((field) => ({
    key: field.key,
    label: field.label,
    input:
      field.valueType === "Text"
        ? "text"
        : field.valueType === "Number"
          ? "number"
          : field.valueType === "Date"
            ? "date"
            : field.valueType === "Dropdown"
              ? "select"
              : "text",
    options: field.valueType === "Dropdown" ? field.dropdownOptions : undefined,
    readOnly: !options.isAdmin && field.supervisorAccess === "Supervisor Can View",
  }));
}
