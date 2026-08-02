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

export type MasterValueStatus = "Active" | "Inactive";

export type MasterValue = {
  id: string;
  category: MasterValueCategory;
  value: string;
  description: string;
  status: MasterValueStatus;
};

export type MasterValueFormValues = {
  value: string;
  description: string;
  status: MasterValueStatus;
};

export type CustomFieldValueType = "Text" | "Number" | "Date" | "Amount" | "Yes / No" | "Dropdown";

export type CustomField = {
  id: string;
  key: string;
  label: string;
  group: string;
  width: number;
  valueType: CustomFieldValueType;
  dropdownOptions: string[];
  required: boolean;
  status: MasterValueStatus;
};

export type CustomFieldFormValues = {
  key: string;
  label: string;
  group: string;
  width: string;
  valueType: CustomFieldValueType;
  dropdownOptions: string[];
  required: boolean;
  status: MasterValueStatus;
};

export type HolidayType = "National" | "Restricted" | "Company";

export type Holiday = {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
  status: MasterValueStatus;
};

export type HolidayFormValues = {
  name: string;
  date: string;
  type: HolidayType;
  status: MasterValueStatus;
};

export type MasterTabId = MasterValueCategory | "Holidays" | "Master Sheet Columns";

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
  { id: "Holidays", label: "Holidays" },
  { id: "Master Sheet Columns", label: "Master Sheet Columns" },
];
