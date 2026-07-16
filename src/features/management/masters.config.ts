export type MasterValueStatus = "Active" | "Inactive";

export type MasterValueCategory =
  | "Payment Types"
  | "Connection Types"
  | "House Types"
  | "Schemes"
  | "Document Categories"
  | "Staff Roles"
  | "Bank Types"
  | "UPI Types"
  | "Material Categories";

export type MasterSheetColumnValueType =
  | "Text"
  | "Number"
  | "Date"
  | "Amount"
  | "Yes / No"
  | "Dropdown";

export type MasterValueRecord = {
  id: string;
  category: MasterValueCategory;
  value: string;
  description: string;
  status: MasterValueStatus;
};

export type MasterSheetColumnConfig = {
  id: string;
  key: string;
  label: string;
  group: string;
  width: number;
  valueType: MasterSheetColumnValueType;
  required: boolean;
  status: MasterValueStatus;
  dropdownOptions?: string[];
};

export type MasterTabId = MasterValueCategory | "Master Sheet Columns";

export const masterValueCategories: MasterValueCategory[] = [
  "Payment Types",
  "Connection Types",
  "House Types",
  "Schemes",
  "Document Categories",
  "Staff Roles",
  "Bank Types",
  "UPI Types",
  "Material Categories",
];

export const masterTabs: Array<{ id: MasterTabId; label: string }> = [
  ...masterValueCategories.map((category) => ({ id: category, label: category })),
  { id: "Master Sheet Columns", label: "Master Sheet Columns" },
];

export const masterSheetColumnValueTypes: MasterSheetColumnValueType[] = [
  "Text",
  "Number",
  "Date",
  "Amount",
  "Yes / No",
  "Dropdown",
];

export const masterValues: MasterValueRecord[] = [
  { id: "pay-1", category: "Payment Types", value: "Cash", description: "Cash payment received at office or field.", status: "Active" },
  { id: "pay-2", category: "Payment Types", value: "UPI", description: "UPI based customer or staff payment.", status: "Active" },
  { id: "pay-3", category: "Payment Types", value: "Bank Transfer", description: "NEFT, RTGS or account transfer.", status: "Active" },
  { id: "conn-1", category: "Connection Types", value: "Domestic", description: "Residential PNG connection.", status: "Active" },
  { id: "conn-2", category: "Connection Types", value: "Commercial", description: "Commercial PNG connection.", status: "Active" },
  { id: "conn-3", category: "Connection Types", value: "Industrial", description: "Industrial connection category.", status: "Active" },
  { id: "house-1", category: "House Types", value: "Individual House", description: "Single residential premise.", status: "Active" },
  { id: "house-2", category: "House Types", value: "Flat", description: "Apartment or multi-floor housing unit.", status: "Active" },
  { id: "scheme-1", category: "Schemes", value: "Standard", description: "Default customer billing scheme.", status: "Active" },
  { id: "scheme-2", category: "Schemes", value: "Subsidy", description: "Subsidy or special customer scheme.", status: "Active" },
  { id: "doc-1", category: "Document Categories", value: "Customer Documents", description: "Customer level KYC and field documents.", status: "Active" },
  { id: "doc-2", category: "Document Categories", value: "Certificates", description: "Certificates and completion documents.", status: "Active" },
  { id: "role-1", category: "Staff Roles", value: "Supervisor", description: "Field supervisor role.", status: "Active" },
  { id: "role-2", category: "Staff Roles", value: "Field Executive", description: "Survey and field execution role.", status: "Active" },
  { id: "bank-1", category: "Bank Types", value: "Savings", description: "Savings account.", status: "Active" },
  { id: "bank-2", category: "Bank Types", value: "Current", description: "Current account.", status: "Active" },
  { id: "bank-3", category: "Bank Types", value: "Salary Account", description: "Salary account.", status: "Active" },
  { id: "upi-1", category: "UPI Types", value: "Personal UPI", description: "Personal UPI handle.", status: "Active" },
  { id: "upi-2", category: "UPI Types", value: "Team UPI", description: "Team or group UPI handle.", status: "Active" },
  { id: "mat-1", category: "Material Categories", value: "Pipe", description: "Pipe stock category.", status: "Active" },
  { id: "mat-2", category: "Material Categories", value: "Fitting", description: "Fittings and accessories.", status: "Active" },
  { id: "mat-3", category: "Material Categories", value: "Regulator", description: "Regulator stock category.", status: "Active" },
];

export const configurableMasterSheetColumns: MasterSheetColumnConfig[] = [
  {
    id: "msc-1",
    key: "preferredPaymentType",
    label: "Preferred Payment Type",
    group: "Payment",
    width: 170,
    valueType: "Dropdown",
    dropdownOptions: ["Cash", "UPI", "Bank Transfer"],
    required: false,
    status: "Active",
  },
  {
    id: "msc-2",
    key: "kycVerified",
    label: "KYC Verified",
    group: "Customer",
    width: 130,
    valueType: "Yes / No",
    required: false,
    status: "Active",
  },
  {
    id: "msc-3",
    key: "lastPaymentDate",
    label: "Last Payment Date",
    group: "Payment",
    width: 150,
    valueType: "Date",
    required: false,
    status: "Active",
  },
  {
    id: "msc-4",
    key: "securityDeposit",
    label: "Security Deposit",
    group: "Payment",
    width: 150,
    valueType: "Amount",
    required: false,
    status: "Inactive",
  },
];

export function getActiveMasterSheetColumns() {
  return configurableMasterSheetColumns.filter((column) => column.status === "Active");
}
