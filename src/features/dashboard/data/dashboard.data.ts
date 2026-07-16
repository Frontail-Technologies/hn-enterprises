import type { ElementType } from "react";
import {
  ClipboardTextIcon,
  FileTextIcon,
  FolderOpenIcon,
  GaugeIcon,
  InvoiceIcon,
  ListChecksIcon,
  NotePencilIcon,
  ReceiptIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

export type DashboardMetric = {
  label: string;
  value: string;
  helperText: string;
  icon: ElementType;
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

export type ProgressSegment = {
  label: string;
  value: number;
  className: string;
};

export type ActivityItem = {
  title: string;
  time: string;
  icon: ElementType;
};

export const dashboardMetricsByPeriod: Record<DashboardMetricPeriod, DashboardMetric[]> = {
  today: [
    {
      label: "Total Projects",
      value: "6",
      helperText: "View all projects",
      icon: FolderOpenIcon,
    },
    {
      label: "Active Sites",
      value: "11",
      helperText: "View active sites",
      icon: GaugeIcon,
    },
    {
      label: "Pending Surveys",
      value: "4",
      helperText: "View surveys",
      icon: ClipboardTextIcon,
    },
    {
      label: "Pending GFC Drawings",
      value: "3",
      helperText: "View drawings",
      icon: FileTextIcon,
    },
    {
      label: "Pending JMR",
      value: "5",
      helperText: "View JMR",
      icon: ReceiptIcon,
    },
    {
      label: "Reports Pending Approval",
      value: "2",
      helperText: "View reports",
      icon: ListChecksIcon,
    },
    {
      label: "Billing Done",
      value: "\u20B9 18.4 L",
      helperText: "View billing",
      icon: InvoiceIcon,
    },
    {
      label: "Billing Pending",
      value: "\u20B9 9.6 L",
      helperText: "View pending",
      icon: NotePencilIcon,
    },
  ],
  "this-month": [
    {
      label: "Total Projects",
      value: "48",
      helperText: "View all projects",
      icon: FolderOpenIcon,
    },
    {
      label: "Active Sites",
      value: "18",
      helperText: "View active sites",
      icon: GaugeIcon,
    },
    {
      label: "Pending Surveys",
      value: "12",
      helperText: "View surveys",
      icon: ClipboardTextIcon,
    },
    {
      label: "Pending GFC Drawings",
      value: "8",
      helperText: "View drawings",
      icon: FileTextIcon,
    },
    {
      label: "Pending JMR",
      value: "15",
      helperText: "View JMR",
      icon: ReceiptIcon,
    },
    {
      label: "Reports Pending Approval",
      value: "9",
      helperText: "View reports",
      icon: ListChecksIcon,
    },
    {
      label: "Billing Done",
      value: "\u20B9 3.24 Cr",
      helperText: "View billing",
      icon: InvoiceIcon,
    },
    {
      label: "Billing Pending",
      value: "\u20B9 1.18 Cr",
      helperText: "View pending",
      icon: NotePencilIcon,
    },
  ],
  "this-year": [
    {
      label: "Total Projects",
      value: "126",
      helperText: "View all projects",
      icon: FolderOpenIcon,
    },
    {
      label: "Active Sites",
      value: "74",
      helperText: "View active sites",
      icon: GaugeIcon,
    },
    {
      label: "Pending Surveys",
      value: "38",
      helperText: "View surveys",
      icon: ClipboardTextIcon,
    },
    {
      label: "Pending GFC Drawings",
      value: "21",
      helperText: "View drawings",
      icon: FileTextIcon,
    },
    {
      label: "Pending JMR",
      value: "44",
      helperText: "View JMR",
      icon: ReceiptIcon,
    },
    {
      label: "Reports Pending Approval",
      value: "27",
      helperText: "View reports",
      icon: ListChecksIcon,
    },
    {
      label: "Billing Done",
      value: "\u20B9 18.6 Cr",
      helperText: "View billing",
      icon: InvoiceIcon,
    },
    {
      label: "Billing Pending",
      value: "\u20B9 4.8 Cr",
      helperText: "View pending",
      icon: NotePencilIcon,
    },
  ],
};

export const workProgress: ProgressSegment[] = [
  { label: "Completed", value: 68, className: "bg-primary" },
  { label: "In Progress", value: 22, className: "bg-status-warning" },
  { label: "Not Started", value: 10, className: "bg-border" },
];

export const recentActivity: ActivityItem[] = [
  {
    title: "Survey completed for Shyam Nagar CGD Project",
    time: "2 hours ago",
    icon: UsersThreeIcon,
  },
  {
    title: "GFC Drawing submitted for Green City Phase 2",
    time: "5 hours ago",
    icon: FileTextIcon,
  },
  {
    title: "JMR #JMR-125 submitted for Sunrise Enclave",
    time: "Yesterday",
    icon: ReceiptIcon,
  },
  {
    title: "Report submitted for City Gas Network - Jaipur",
    time: "Yesterday",
    icon: ClipboardTextIcon,
  },
  {
    title: "Invoice #INV-324 generated for Green City Phase 1",
    time: "2 days ago",
    icon: InvoiceIcon,
  },
];
