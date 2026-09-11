import type { CustomFieldValueType as MasterSheetColumnValueType } from "@/features/dynamic-fields/types";

export type CustomerMasterSheetRow = {
  id: string;
  customerId: string;
  values: Record<string, string>;
};

export type CustomerMasterSheetColumn = {
  key: string;
  label: string;
  group: string;
  width?: number;
  sticky?: boolean;
  valueType?: MasterSheetColumnValueType;
  required?: boolean;
  dropdownOptions?: string[];
  getFilterGroups?: (row: CustomerMasterSheetRow) => string[];
};

export type CustomerColumnType = "text" | "num" | "money" | "date" | "bool";

export type ResolvedCustomerColumn = {
  key: string;
  label: string;
  group: string;
  type: CustomerColumnType;
  width: number;
  visible: boolean;
  custom: boolean;
};

export type ColumnPreferenceEntry = { key: string; visible: boolean };

/**
 * Canonical per-column filter-group derivation, keyed by master-sheet column
 * key. Single source of truth - also used to build `getFilterGroups` on the
 * matching entry in `baseCustomerMasterSheetColumns` below, and imported
 * directly by consumers (e.g. the master sheet grid) that only have the
 * server-resolved `ResolvedCustomerColumn` shape (no function fields).
 */
export const CUSTOM_FILTER_GROUPS: Partial<Record<string, (row: CustomerMasterSheetRow) => string[]>> = {
  fullAddress: (row) => {
    const address = row.values.fullAddress || "";
    if (!address) return ["(Blank)"];
    return Array.from(
      new Set(
        address
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length >= 3 && !/^\d+$/.test(part)),
      ),
    );
  },
};

export const baseCustomerMasterSheetColumns: CustomerMasterSheetColumn[] = [
  {
    key: "reportNoGi",
    label: "Report No-GI",
    group: "Reports",
    width: 150,
    sticky: true,
  },
  {
    key: "reportNoGc",
    label: "Report No-GC",
    group: "Reports",
    width: 150,
    sticky: true,
  },
  {
    key: "reportNoConversion",
    label: "Report No-Conversion",
    group: "Reports",
    width: 180,
    sticky: true,
  },
  {
    key: "trBpNo",
    label: "TR No.",
    group: "Customer",
    width: 150,
    sticky: true,
  },
  {
    key: "customerName",
    label: "Customer Name",
    group: "Customer",
    width: 190,
  },
  { key: "mobileNo", label: "Mobile No.", group: "Customer", width: 130 },
  {
    key: "fullAddress",
    label: "Address",
    group: "Customer",
    width: 260,
    getFilterGroups: CUSTOM_FILTER_GROUPS.fullAddress,
  },
  { key: "projectName", label: "Project", group: "Project", width: 190 },
  { key: "siteArea", label: "Site / Area", group: "Project", width: 170 },
  { key: "scheme", label: "Scheme", group: "Customer", width: 130 },
  {
    key: "paymentStatus",
    label: "Payment Status",
    group: "Payment",
    width: 140,
  },
  { key: "paymentMode", label: "Payment Mode", group: "Payment", width: 130 },
  {
    key: "initialAmount",
    label: "Initial Amount",
    group: "Payment",
    width: 140,
  },
  { key: "surveyDate", label: "Survey Date", group: "Survey", width: 130 },
  {
    key: "workableStatus",
    label: "Workable Status",
    group: "Survey",
    width: 150,
  },
  {
    key: "surveyRemarks",
    label: "Survey Remarks",
    group: "Survey",
    width: 220,
  },
  {
    key: "plumberName",
    label: "Plumber Name",
    group: "Assignment",
    width: 150,
  },
  { key: "meterNo", label: "Meter No.", group: "Meter", width: 140 },
  {
    key: "installationDate",
    label: "Installation Date",
    group: "Meter",
    width: 150,
  },
  { key: "jobCardDone", label: "Job Card Done", group: "Customer", width: 140 },
  {
    key: "connectionType",
    label: "Connection Type",
    group: "Customer",
    width: 150,
  },
  { key: "houseType", label: "House Type", group: "Customer", width: 140 },
  {
    key: "tfToRegulator",
    label: "TF to Regulator GI Measurement",
    group: "GI",
    width: 210,
  },
  { key: "inlet", label: "Inlet GI Measurement", group: "GI", width: 180 },
  { key: "outlet", label: "Outlet GI Measurement", group: "GI", width: 180 },
  {
    key: "totalGiPipeHalfInch",
    label: "Total GI Pipe 1/2 inch",
    group: "GI",
    width: 180,
  },
  {
    key: "giPipeThreeQuarterInch",
    label: "GI Pipe 3/4 inch",
    group: "GI",
    width: 160,
  },
  { key: "giPipeOneInch", label: "GI Pipe 1 inch", group: "GI", width: 140 },
  {
    key: "giPipeOneAndHalfInch",
    label: "GI Pipe 1.5 inch Welded",
    group: "GI",
    width: 190,
  },
  {
    key: "giPipeTwoInch",
    label: "GI Pipe 2 inch Welded",
    group: "GI",
    width: 180,
  },
  {
    key: "isolationValveHalfInch",
    label: "Isolation Valve 1/2 inch",
    group: "Valves",
    width: 190,
  },
  {
    key: "isolationValveThreeQuarterInch",
    label: "Isolation Valve 3/4 inch",
    group: "Valves",
    width: 190,
  },
  {
    key: "isolationValveOneInch",
    label: "Isolation Valve 1 inch",
    group: "Valves",
    width: 170,
  },
  {
    key: "isolationValveOneAndHalfInch",
    label: "Isolation Valve 1.5 inch",
    group: "Valves",
    width: 180,
  },
  {
    key: "isolationValveTwoInch",
    label: "Isolation Valve 2 inch",
    group: "Valves",
    width: 170,
  },
  {
    key: "applianceValveHalfInch",
    label: "Appliance Valve 1/2 inch",
    group: "Valves",
    width: 190,
  },
  {
    key: "regulator6BarTo100Mbar",
    label: "Regulator 6Bar-100mBar",
    group: "Regulators",
    width: 190,
  },
  {
    key: "regulator6BarTo21Mbar",
    label: "Regulator 6Bar-21mBar",
    group: "Regulators",
    width: 180,
  },
  {
    key: "regulator100MbarTo21Mbar",
    label: "Regulator 100mBar-21mBar",
    group: "Regulators",
    width: 200,
  },
  {
    key: "warningPlate",
    label: "Warning Plate",
    group: "Regulators",
    width: 140,
  },
  {
    key: "clampHalfInch",
    label: "Clamp 1/2 inch",
    group: "Fittings",
    width: 140,
  },
  {
    key: "clamp3InchToHalfInch",
    label: "Clamp 3 inch-1/2 inch",
    group: "Fittings",
    width: 180,
  },
  {
    key: "elbowHalfInch",
    label: "Elbow 1/2 inch",
    group: "Fittings",
    width: 140,
  },
  {
    key: "mfElbowHalfInch",
    label: "M/F Elbow 1/2 inch",
    group: "Fittings",
    width: 160,
  },
  {
    key: "socketHalfInch",
    label: "Socket 1/2 inch",
    group: "Fittings",
    width: 150,
  },
  { key: "teeHalfInch", label: "Tee 1/2 inch", group: "Fittings", width: 130 },
  { key: "nipple2Inch", label: "Nipple 2 inch", group: "Fittings", width: 130 },
  { key: "nipple3Inch", label: "Nipple 3 inch", group: "Fittings", width: 130 },
  { key: "nipple4Inch", label: "Nipple 4 inch", group: "Fittings", width: 130 },
  {
    key: "reducerElbowThreeQuarterToHalfInch",
    label: "Reducer Elbow 3/4-1/2 inch",
    group: "Fittings",
    width: 210,
  },
  {
    key: "threeQuarterInchTo3Inch",
    label: "3/4 inch-3 inch",
    group: "Fittings",
    width: 150,
  },
  {
    key: "unionHalfInch",
    label: "Union 1/2 inch",
    group: "Fittings",
    width: 140,
  },
  {
    key: "plugHalfInch",
    label: "Plug 1/2 inch",
    group: "Fittings",
    width: 130,
  },
  {
    key: "extraGiAbove10Metres",
    label: "Extra GI Above 10 Metres",
    group: "Fittings",
    width: 200,
  },
  { key: "pipe20Length", label: "20 mm Pipe Length", group: "LMC", width: 160 },
  {
    key: "pipe20LayingDate",
    label: "20 mm Laying Date",
    group: "LMC",
    width: 160,
  },
  {
    key: "pipe20TestingDate",
    label: "20 mm Testing Date",
    group: "LMC",
    width: 160,
  },
  {
    key: "pipe20PurgingDate",
    label: "20 mm Purging Date",
    group: "LMC",
    width: 160,
  },
  { key: "pipe32Length", label: "32 mm Pipe Length", group: "LMC", width: 160 },
  { key: "pipe63Length", label: "63 mm Pipe Length", group: "LMC", width: 160 },
  { key: "pipe90Length", label: "90 mm Pipe Length", group: "LMC", width: 160 },
  {
    key: "pipe125Length",
    label: "125 mm Pipe Length",
    group: "LMC",
    width: 170,
  },
  {
    key: "fourMetresUnderGc",
    label: "4 Metres Under GC",
    group: "LMC",
    width: 160,
  },
  {
    key: "fourMetresAboveGc",
    label: "4 Metres Above GC",
    group: "LMC",
    width: 160,
  },
  { key: "tfHalfInch", label: "TF 1/2 inch", group: "LMC", width: 130 },
  { key: "tfOneInch", label: "TF 1 inch", group: "LMC", width: 120 },
  { key: "pcc", label: "PCC", group: "Civil", width: 100 },
  {
    key: "rccNalaCrossing",
    label: "RCC / Nala Crossing",
    group: "Civil",
    width: 170,
  },
  { key: "paverBlocks", label: "Paver Blocks", group: "Civil", width: 140 },
  { key: "malua", label: "Malua", group: "Civil", width: 110 },
  { key: "hardRock", label: "Hard Rock", group: "Civil", width: 120 },
  {
    key: "saddle90To32Mm",
    label: "Saddle 90-32 mm",
    group: "MDPE",
    width: 150,
  },
  {
    key: "saddle63To32Mm",
    label: "Saddle 63-32 mm",
    group: "MDPE",
    width: 150,
  },
  {
    key: "saddle32To20Mm",
    label: "Saddle 32-20 mm",
    group: "MDPE",
    width: 150,
  },
  { key: "tee32Mm", label: "Tee 32 mm", group: "MDPE", width: 120 },
  { key: "tee20Mm", label: "Tee 20 mm", group: "MDPE", width: 120 },
  {
    key: "reducerCoupler63To32Mm",
    label: "Reducer Coupler 63-32 mm",
    group: "MDPE",
    width: 210,
  },
  {
    key: "reducerCoupler32To20Mm",
    label: "Reducer Coupler 32-20 mm",
    group: "MDPE",
    width: 210,
  },
  { key: "coupler32Mm", label: "Coupler 32 mm", group: "MDPE", width: 140 },
  { key: "coupler20Mm", label: "Coupler 20 mm", group: "MDPE", width: 140 },
  { key: "coupler90Mm", label: "90 mm Coupler", group: "MDPE", width: 140 },
  {
    key: "reducerCoupler90To63Mm",
    label: "90-63 mm Reducer Coupler",
    group: "MDPE",
    width: 210,
  },
  { key: "tee90Mm", label: "90 mm Tee", group: "MDPE", width: 120 },
  { key: "endCap90Mm", label: "90 mm End Cap", group: "MDPE", width: 140 },
  {
    key: "commissioningDate",
    label: "Commissioning Date",
    group: "Commissioning",
    width: 160,
  },
  {
    key: "conversionDate",
    label: "Conversion Date",
    group: "Commissioning",
    width: 150,
  },
  {
    key: "regulatorPressure",
    label: "Regulator Pressure",
    group: "Commissioning",
    width: 160,
  },
  {
    key: "regulatorNo",
    label: "Regulator No.",
    group: "Commissioning",
    width: 140,
  },
  { key: "meterType", label: "Meter Type", group: "Commissioning", width: 130 },
  {
    key: "meterReading",
    label: "Meter Reading",
    group: "Commissioning",
    width: 140,
  },
  {
    key: "nonConversionRemark",
    label: "Non Conversion Remark",
    group: "Commissioning",
    width: 220,
  },
  { key: "jmrDone", label: "JMR Done", group: "Billing", width: 120 },
  {
    key: "jmrSubmittedInPbg",
    label: "JMR Submitted in PBG",
    group: "Billing",
    width: 180,
  },
  { key: "giBillDone", label: "GI Bill Done", group: "Billing", width: 130 },
  { key: "gcBillDone", label: "GC Bill Done", group: "Billing", width: 130 },
  {
    key: "conversionBillDone",
    label: "Conversion Bill Done",
    group: "Billing",
    width: 170,
  },
  { key: "billingRemark", label: "Remark", group: "Billing", width: 220 },
];

export function buildCustomerMasterSheetColumns(
  activeCustomFields: {
    key: string;
    label: string;
    group: string;
    width: number;
    valueType: MasterSheetColumnValueType;
    required: boolean;
    dropdownOptions: string[];
  }[],
): CustomerMasterSheetColumn[] {
  return [
    ...baseCustomerMasterSheetColumns,
    ...activeCustomFields.map((column) => ({
      key: column.key,
      label: column.label,
      group: column.group,
      width: column.width,
      valueType: column.valueType,
      required: column.required,
      dropdownOptions: column.dropdownOptions,
    })),
  ];
}
