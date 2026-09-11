import type { ElementType } from "react";
import {
  CalendarCheckIcon,
  ClipboardTextIcon,
  CurrencyInrIcon,
  FolderOpenIcon,
  GaugeIcon,
  InfoIcon,
  InvoiceIcon,
  ListChecksIcon,
  UsersThreeIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { ActivityType } from "@/features/dashboard/services/activity.service";

export const METRIC_ICON_BY_ID: Record<string, ElementType> = {
  "total-projects": FolderOpenIcon,
  "active-sites": GaugeIcon,
  "overdue-bills": InvoiceIcon,
  "stock-alerts": WarningIcon,
  "pending-approvals": ClipboardTextIcon,
  "billing-pending": InvoiceIcon,
  "monthly-expenses": CurrencyInrIcon,
  "dpr-pending": CalendarCheckIcon,
  "field-updates": UsersThreeIcon,
  "total-customers": UsersThreeIcon,
  "survey-done": ClipboardTextIcon,
  "gi-done": GaugeIcon,
  "gc-done": WarningIcon,
  "conversion-done": CalendarCheckIcon,
  "jmr-done": ClipboardTextIcon,
  "gi-bill-done": InvoiceIcon,
  "gc-bill-done": InvoiceIcon,
  "conversion-bill-done": InvoiceIcon,
  "connection-remark": WarningIcon,
  "total-pbg-assignment": ListChecksIcon,
};

export const DEFAULT_METRIC_ICON: ElementType = GaugeIcon;

export type MetricTone = "primary" | "info" | "success" | "warning" | "danger";

export const METRIC_TONE_BY_ID: Record<string, MetricTone> = {
  "total-projects": "info",
  "active-sites": "info",
  "overdue-bills": "danger",
  "stock-alerts": "warning",
  "pending-approvals": "warning",
  "billing-pending": "primary",
  "monthly-expenses": "success",
  "dpr-pending": "warning",
  "field-updates": "info",
  "total-customers": "primary",
  "survey-done": "info",
  "gi-done": "info",
  "gc-done": "info",
  "conversion-done": "success",
  "jmr-done": "info",
  "gi-bill-done": "success",
  "gc-bill-done": "success",
  "conversion-bill-done": "success",
  "connection-remark": "warning",
  "total-pbg-assignment": "info",
};

export const DEFAULT_METRIC_TONE: MetricTone = "info";

export const PRIMARY_METRIC_IDS = new Set([
  "total-projects",
  "active-sites",
  "overdue-bills",
  "stock-alerts",
  "pending-approvals",
  "billing-pending",
  "monthly-expenses",
  "dpr-pending",
  "field-updates",
  "total-customers",
]);

export const ACTIVITY_ICON_BY_TYPE: Record<ActivityType, ElementType> = {
  Work: UsersThreeIcon,
  Survey: UsersThreeIcon,
  DPR: ClipboardTextIcon,
  Billing: CurrencyInrIcon,
  System: InfoIcon,
};
