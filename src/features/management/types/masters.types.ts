export type MasterValueCategory =
  | "Payment Types"
  | "Connection Types"
  | "House Types"
  | "Schemes"
  | "Document Categories"
  | "Material Categories"
  | "Meter Types";

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

export type MasterTabId = MasterValueCategory | "Holidays";

export const masterValueCategories: MasterValueCategory[] = [
  "Payment Types",
  "Connection Types",
  "House Types",
  "Schemes",
  "Document Categories",
  "Material Categories",
  "Meter Types",
];

export const masterTabs: Array<{ id: MasterTabId; label: string }> = [
  ...masterValueCategories.map((category) => ({ id: category, label: category })),
  { id: "Holidays", label: "Holidays" },
];
