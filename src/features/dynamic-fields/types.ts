import type { MasterValueStatus } from "@/features/management/types/masters.types";

export type CustomFieldValueType = "Text" | "Number" | "Date" | "Amount" | "Yes / No" | "Dropdown";
export type CustomFieldAccess = "Admin Only" | "Supervisor Can View" | "Supervisor Can View & Edit";

export type CustomField = {
  id: string;
  key: string;
  label: string;
  group: string;
  width: number;
  valueType: CustomFieldValueType;
  dropdownOptions: string[];
  required: boolean;
  sortOrder: number;
  supervisorAccess: CustomFieldAccess;
  status: MasterValueStatus;
};

export type CustomFieldFormValues = {
  label: string;
  group: string;
  valueType: CustomFieldValueType;
  dropdownOptions: string[];
  required: boolean;
  supervisorAccess: CustomFieldAccess;
  status: MasterValueStatus;
};

export type ReorderCustomFieldItem = {
  id: string;
  groupName: string;
  sortOrder: number;
};

export type CustomFieldImportRow = {
  rowNumber: number;
  label: string;
  groupName: string;
  valueType: CustomFieldValueType;
  dropdownOptions: string[];
  required: boolean;
  supervisorAccess: CustomFieldAccess;
  sortOrder?: number;
  issues: string[];
  warnings: string[];
};
