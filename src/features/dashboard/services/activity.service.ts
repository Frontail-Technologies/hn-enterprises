import {
  CalendarCheckIcon,
  ClipboardTextIcon,
  CurrencyInrIcon,
  FileTextIcon,
  FolderOpenIcon,
  GaugeIcon,
  ReceiptIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import type { ElementType } from "react";
import { payments } from "@/features/commercial/data/payments.data";
import { customerActivity, customers } from "@/features/customers/services/customers.service";
import { planningDprRecords } from "@/features/planning/services/planning.service";
import { projectActivity } from "@/features/projects/services/projects.service";

export type ActivityType =
  | "Customer"
  | "Project"
  | "Survey"
  | "DPR"
  | "Billing"
  | "Inventory"
  | "Attendance"
  | "Document";

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  actor: string;
  supervisor: string;
  project: string;
  site: string;
  relatedRecord: string;
  dateTime: string;
  icon: ElementType;
};

export type ActivityFilters = {
  search: string;
  type: string;
  supervisor: string;
  project: string;
  sort: string;
};

export const activityTypeOptions = [
  "Customer",
  "Project",
  "Survey",
  "DPR",
  "Billing",
  "Inventory",
  "Attendance",
  "Document",
].map((type) => ({ label: type, value: type }));

export function getActivityRows(filters: ActivityFilters) {
  const search = filters.search.trim().toLowerCase();

  return buildActivities()
    .filter((activity) => {
      const searchMatch =
        !search ||
        [
          activity.title,
          activity.description,
          activity.actor,
          activity.supervisor,
          activity.project,
          activity.site,
          activity.relatedRecord,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const typeMatch = filters.type === "all" || activity.type === filters.type;
      const supervisorMatch =
        filters.supervisor === "all" || activity.supervisor === filters.supervisor;
      const projectMatch = filters.project === "all" || activity.project === filters.project;

      return searchMatch && typeMatch && supervisorMatch && projectMatch;
    })
    .sort((first, second) => {
      const a = new Date(first.dateTime).getTime();
      const b = new Date(second.dateTime).getTime();
      return filters.sort === "oldest" ? a - b : b - a;
    });
}

export function getActivityFilterOptions() {
  const activities = buildActivities();

  return {
    supervisors: uniqueOptions(
      activities.map((activity) => activity.supervisor).filter(Boolean),
    ),
    projects: uniqueOptions(activities.map((activity) => activity.project).filter(Boolean)),
  };
}

function buildActivities(): DashboardActivity[] {
  const customerRows = customerActivity.flatMap<DashboardActivity>((activity) =>
    customers.slice(0, 2).map((customer, index) => ({
      id: `customer-${activity.id}-${customer.id}`,
      title: activity.title,
      description: activity.description,
      type: activity.title.toLowerCase().includes("survey") ? "Survey" : "Customer",
      actor: activity.actor,
      supervisor: customer.customerConnection.supervisorName,
      project: customer.projectName,
      site: customer.siteArea,
      relatedRecord: index === 0 ? activity.relatedRecord : customer.customerConnection.trBpNo,
      dateTime: normalizeDateTime(activity.dateTime, index),
      icon: UsersThreeIcon,
    })),
  );

  const projectRows = projectActivity.map<DashboardActivity>((activity, index) => ({
    id: `project-${activity.id}`,
    title: activity.title,
    description: activity.description,
    type: activity.title.toLowerCase().includes("document") ? "Document" : "Project",
    actor: activity.actor,
    supervisor: activity.actor,
    project: "Shyam Nagar CGD Project",
    site: index === 1 ? "Shyam Nagar Block A" : "-",
    relatedRecord: activity.relatedRecord,
    dateTime: normalizeDateTime(activity.dateTime, index),
    icon: activity.title.toLowerCase().includes("document") ? FileTextIcon : FolderOpenIcon,
  }));

  const dprRows = planningDprRecords.map<DashboardActivity>((record) => ({
    id: `dpr-${record.id}`,
    title: `DPR ${record.status.toLowerCase()}`,
    description: `${record.photoCount} photos attached. ${record.remarks}`,
    type: "DPR",
    actor: "Amit Rathore",
    supervisor: "Amit Rathore",
    project: "Shyam Nagar CGD Project",
    site: record.siteAddress,
    relatedRecord: record.id.toUpperCase(),
    dateTime: `${record.date} 18:00`,
    icon: CalendarCheckIcon,
  }));

  const paymentRows = payments.map<DashboardActivity>((payment) => ({
    id: `payment-${payment.id}`,
    title: `${payment.category} ${payment.status.toLowerCase()}`,
    description: `${payment.paidTo} - ${payment.projectSite}`,
    type: "Billing",
    actor: "Accounts",
    supervisor: payment.paidTo,
    project: payment.projectSite,
    site: payment.projectSite,
    relatedRecord: payment.id.toUpperCase(),
    dateTime: `${payment.date} 16:30`,
    icon: CurrencyInrIcon,
  }));

  const systemRows: DashboardActivity[] = [
    {
      id: "inventory-alert-mat-002",
      title: "Material stock alert",
      description: "Brass Regulator reached reorder level.",
      type: "Inventory",
      actor: "System",
      supervisor: "Store Admin",
      project: "Shyam Nagar CGD Project",
      site: "Shyam Nagar Block B",
      relatedRecord: "MAT-002",
      dateTime: "2025-02-18 11:15",
      icon: GaugeIcon,
    },
    {
      id: "attendance-late-st-1",
      title: "Late attendance marked",
      description: "Amit Rathore checked in after scheduled time.",
      type: "Attendance",
      actor: "Amit Rathore",
      supervisor: "Amit Rathore",
      project: "Shyam Nagar CGD Project",
      site: "Shyam Nagar Block B",
      relatedRecord: "ATT-002",
      dateTime: "2026-07-02 10:05",
      icon: ClipboardTextIcon,
    },
    {
      id: "bill-overdue-003",
      title: "Bill overdue",
      description: "Commissioning bill has pending amount.",
      type: "Billing",
      actor: "Accounts",
      supervisor: "Neha Verma",
      project: "Green City Phase 1",
      site: "Green City Township",
      relatedRecord: "BILL-2025-003",
      dateTime: "2025-02-18 09:45",
      icon: ReceiptIcon,
    },
  ];

  return [...customerRows, ...projectRows, ...dprRows, ...paymentRows, ...systemRows];
}

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values))
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }));
}

function normalizeDateTime(value: string, offsetDays: number) {
  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return value;
  date.setDate(date.getDate() + offsetDays);

  return date.toISOString().slice(0, 16).replace("T", " ");
}
