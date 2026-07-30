export type InventoryTab =
  | "stock"
  | "purchase"
  | "pbgIssue"
  | "pbgConsumption"
  | "storeIssue"
  | "totalIssue"
  | "plumberBalance"
  | "plumberConsumption";

export type BillingView = "bills" | "wages";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};
