export type AdminSummaryStatKey =
  | "total-projects"
  | "active-sites"
  | "stock-alerts"
  | "pending-approvals"
  | "billing-pending"
  | "monthly-expenses"
  | "dpr-pending";

export type AdminSummaryStatDefinition = {
  key: AdminSummaryStatKey;
  title: string;
  helperText: string;
};

export const adminSummaryStatDefinitions: AdminSummaryStatDefinition[] = [
  {
    key: "total-projects",
    title: "Total Projects",
    helperText: "Projects in selected scope",
  },
  {
    key: "active-sites",
    title: "Active Sites",
    helperText: "Field locations in progress",
  },
  {
    key: "stock-alerts",
    title: "Stock Alerts",
    helperText: "Materials low or out of stock",
  },
  {
    key: "pending-approvals",
    title: "Pending Approvals",
    helperText: "Surveys, payments and bills awaiting approval",
  },
  {
    key: "billing-pending",
    title: "Billing Pending",
    helperText: "Bills in the selected period",
  },
  {
    key: "monthly-expenses",
    title: "Monthly Expenses",
    helperText: "Approved expenses in the selected period",
  },
  {
    key: "dpr-pending",
    title: "DPR Pending",
    helperText: "DPR records not yet approved in the selected period",
  },
];

export function isAdminSummaryStatKey(value: string): value is AdminSummaryStatKey {
  return adminSummaryStatDefinitions.some((definition) => definition.key === value);
}

export function getAdminSummaryStatDefinition(key: AdminSummaryStatKey) {
  return adminSummaryStatDefinitions.find((definition) => definition.key === key)!;
}
