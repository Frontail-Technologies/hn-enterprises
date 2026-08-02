import type { ElementType } from "react";

export type DashboardMetric = {
  label: string;
  value: string;
  helperText: string;
  icon: ElementType;
  href?: string;
};

export type DashboardPeriod =
  | "today"
  | "this-month"
  | "this-year"
  | "custom-month"
  | "custom-year";

export type DashboardMetricPeriod = "today" | "this-month" | "this-year";

export const dashboardPeriods: Array<{
  label: string;
  value: DashboardPeriod;
}> = [
  { label: "Today", value: "today" },
  { label: "This Month", value: "this-month" },
  { label: "This Year", value: "this-year" },
];

export type ActivityItem = {
  title: string;
  time: string;
  icon: ElementType;
};
