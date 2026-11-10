import type { ElementType } from "react";
import type { ActivityType } from "@/features/dashboard/services/activity.service";

export type DashboardMetric = {
  id: string;
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

export type ActivityItem = {
  title: string;
  time: string;
  icon: ElementType;
  type: ActivityType;
};
