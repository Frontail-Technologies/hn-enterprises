import { ClipboardTextIcon, CurrencyInrIcon, UsersThreeIcon } from "@phosphor-icons/react";
import type { ElementType } from "react";
import type { Payment } from "@/features/commercial/types/payment.types";
import type { DprRecord } from "@/features/planning/types/planning.types";
import type { WorkProgressUpdate } from "@/features/work-progress/types/work-progress.types";
import type { AuditLog } from "@/features/management/services/audit-logs.service";
import { InfoIcon } from "lucide-react";

export type ActivityType = "Work" | "Survey" | "DPR" | "Billing" | "System";

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
  sort: "newest" | "oldest";
};

export function buildActivities(data: {
  workProgress: WorkProgressUpdate[];
  dprRecords: DprRecord[];
  payments: Payment[];
  auditLogs?: AuditLog[];
}): DashboardActivity[] {
  const workRows = data.workProgress.map<DashboardActivity>((update) => ({
    id: `work-${update.id}`,
    title: `${update.stage} : ${update.status}`,
    description: update.remarks || update.nextRequiredAction || "Work progress updated",
    type: update.stage === "Survey" ? "Survey" : "Work",
    actor: update.supervisor?.name ?? "-",
    supervisor: update.supervisor?.name ?? "-",
    project: update.project?.name ?? "-",
    site: update.site?.name ?? "-",
    relatedRecord: update.customer?.trBpNumber ?? "-",
    dateTime: update.createdAt,
    icon: UsersThreeIcon,
  }));

  const dprRows = data.dprRecords.map<DashboardActivity>((record) => ({
    id: `dpr-${record.id}`,
    title: `DPR ${record.status}`,
    description: record.remarks || "Daily progress report",
    type: "DPR",
    actor: record.supervisorName,
    supervisor: record.supervisorName,
    project: "-",
    site: record.siteLabel,
    relatedRecord: record.id.slice(0, 8).toUpperCase(),
    dateTime: record.date,
    icon: ClipboardTextIcon,
  }));

  const paymentRows = data.payments.map<DashboardActivity>((payment) => ({
    id: `payment-${payment.id}`,
    title: `${payment.category} ${payment.status.toLowerCase()}`,
    description: payment.purpose || payment.remarks || "-",
    type: "Billing",
    actor: "Accounts",
    supervisor: payment.paidTo,
    project: "-",
    site: "-",
    relatedRecord: payment.id.slice(0, 8).toUpperCase(),
    dateTime: payment.paymentDate,
    icon: CurrencyInrIcon,
  }));

  const auditRows = (data.auditLogs || []).map<DashboardActivity>((log) => ({
    id: `audit-${log.id}`,
    title: `${log.module} - ${log.action}`,
    description: log.description || "-",
    type: "System",
    actor: log.user,
    supervisor: log.user,
    project: "-",
    site: "-",
    relatedRecord: log.id.slice(0, 8).toUpperCase(),
    dateTime: log.dateTime,
    icon: InfoIcon as ElementType,
  }));

  return [...workRows, ...dprRows, ...paymentRows, ...auditRows];
}

export function getActivityRows(activities: DashboardActivity[], filters: ActivityFilters) {
  const search = filters.search.trim().toLowerCase();

  return activities
    .filter((activity) => {
      if (!search) return true;
      return [
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
    })
    .sort((first, second) => {
      const a = new Date(first.dateTime).getTime();
      const b = new Date(second.dateTime).getTime();
      return filters.sort === "oldest" ? a - b : b - a;
    });
}
