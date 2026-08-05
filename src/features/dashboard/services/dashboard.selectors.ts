import {
  CalendarCheckIcon,
  ClipboardTextIcon,
  CurrencyInrIcon,
  FolderOpenIcon,
  GaugeIcon,
  InvoiceIcon,
  UsersThreeIcon,
  WarningIcon,
  ListChecksIcon,
} from "@phosphor-icons/react";
import type { Bill } from "@/features/commercial/types/bill.types";
import type { Material } from "@/features/commercial/types/material.types";
import type { Payment } from "@/features/commercial/types/payment.types";
import type { Customer } from "@/features/customers/types/customer.types";
import type { AttendanceRecord } from "@/features/management/data/attendance.data";
import type { DprRecord } from "@/features/planning/types/planning.types";
import type { Project, ProjectSite } from "@/features/projects/types/project.types";
import type { WorkProgressUpdate } from "@/features/work-progress/types/work-progress.types";
import type {
  DashboardMetric,
  DashboardMetricPeriod,
} from "@/features/dashboard/data/dashboard.data";
import {
  type DashboardStatKey,
  getDashboardStatValue,
} from "@/features/dashboard/services/dashboard-stats.service";



export type DashboardScope = {
  projectId: string;
  city: string;
  period: DashboardMetricPeriod;
};

export type DashboardData = {
  customers: Customer[];
  projects: Project[];
  projectSites: ProjectSite[];
  bills: Bill[];
  payments: Payment[];
  materials: Material[];
  dprRecords: DprRecord[];
  workProgress: WorkProgressUpdate[];
  attendance: AttendanceRecord[];
};

export type AttendanceSummaryRow = {
  id: string;
  label: string;
  value: number;
  helper: string;
};

export type DashboardAlert = {
  id: string;
  title: string;
  description: string;
  tone: "warning" | "danger" | "info";
};

export function getAdminDashboardData(
  scope: DashboardScope,
  data: DashboardData,
  adminStats?: Record<string, number>,
) {
  const scopedProjects = getScopedProjects(data.projects, scope);
  const scopedCustomers = getScopedCustomers(data.customers, scope);
  const scopedCustomerIds = new Set(scopedCustomers.map((customer) => customer.id));
  const scopedBills = data.bills.filter((bill) => scopedCustomerIds.has(bill.customerId));
  const scopedPayments = data.payments.filter((payment) => scopedCustomerIds.has(payment.customerId));
  const scopedWorkProgress = data.workProgress.filter((update) => scopedCustomerIds.has(update.customerId));

  const adminMetrics = buildAdminMetrics({
    projectsCount: scopedProjects.length,
    activeSites: getActiveSiteCount(data.projectSites, scope),
    customers: scopedCustomers,
    bills: scopedBills,
    payments: scopedPayments,
    materials: data.materials,
    dprRecords: data.dprRecords,
    workProgress: scopedWorkProgress,
    scope,
  });
  const workflowMetrics = buildCustomerMetrics(scope, adminStats);

  return {
    allMetrics: [...adminMetrics, ...workflowMetrics],
    attendanceRows: buildAttendanceRows(data.attendance),
    alerts: buildAlerts(scopedBills, scopedPayments, scopedCustomers, data.materials, data.dprRecords),
  };
}

export function getScopedProjects(
  projects: Project[],
  { projectId, city }: Pick<DashboardScope, "projectId" | "city">,
) {
  return projects.filter((project) => {
    const projectMatch = projectId === "all" || project.id === projectId;
    const cityMatch = city === "all" || project.city === city;
    return projectMatch && cityMatch;
  });
}

function getScopedCustomers(customers: Customer[], { projectId, city }: DashboardScope) {
  return customers.filter((customer) => {
    const projectMatch = projectId === "all" || customer.projectId === projectId;
    const cityMatch = city === "all" || customer.city === city;
    return projectMatch && cityMatch;
  });
}

export function getPeriodRange(period: DashboardMetricPeriod) {
  const now = new Date();
  if (period === "today") {
    return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: now };
  }
  if (period === "this-year") {
    return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
}

export function withinRange(value: string | undefined, range: { from: Date; to: Date }) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date >= range.from && date <= range.to;
}

function buildAdminMetrics({
  projectsCount,
  activeSites,
  customers,
  bills,
  payments,
  materials,
  dprRecords,
  workProgress,
  scope,
}: {
  projectsCount: number;
  activeSites: number;
  customers: Customer[];
  bills: Bill[];
  payments: Payment[];
  materials: Material[];
  dprRecords: DprRecord[];
  workProgress: WorkProgressUpdate[];
  scope: DashboardScope;
}): DashboardMetric[] {
  const range = getPeriodRange(scope.period);
  const scopeQuery = `projectId=${encodeURIComponent(scope.projectId)}&city=${encodeURIComponent(scope.city)}`;
  const periodQuery = `${scopeQuery}&period=${encodeURIComponent(scope.period)}`;
  const lowStockItems = materials.filter((material) =>
    ["Low Stock", "Out of Stock"].includes(material.status),
  ).length;
  const pendingApprovals =
    customers.filter((customer) =>
      ["Submitted", "In Review", "Sent Back"].includes(customer.survey?.approvalStatus ?? ""),
    ).length +
    payments.filter((payment) => payment.status === "Submitted").length +
    bills.filter((bill) => bill.status === "Submitted").length;
  // Billing/expenses are genuinely period-scoped (a bill/payment happens on a date); project and
  // customer counts are current-state snapshots, not flow metrics, so they aren't scaled by period.
  const billingPending = bills
    .filter((bill) => withinRange(bill.billDate, range))
    .reduce((sum, bill) => sum + bill.pendingAmount, 0);
  const monthlyExpenses = payments
    .filter((payment) => payment.status === "Approved" && withinRange(payment.paymentDate, range))
    .reduce((sum, payment) => sum + payment.amount, 0);
  const dprPending = dprRecords.filter(
    (record) => record.status !== "Approved" && withinRange(record.date, range),
  ).length;
  // Overdue is a current-state snapshot (like project/site counts), not scaled by period.
  const overdueBills = bills.filter((bill) => bill.status === "Overdue").length;
  const fieldUpdates = workProgress.filter((update) => withinRange(update.createdAt, range)).length;

  return [
    {
      id: "total-projects",
      label: "Total Projects",
      value: String(projectsCount),
      helperText: "Across selected scope",
      icon: FolderOpenIcon,
      href: `/dashboard/summary/total-projects?${scopeQuery}`,
    },
    {
      id: "active-sites",
      label: "Active Sites",
      value: String(activeSites),
      helperText: "Field locations",
      icon: GaugeIcon,
      href: `/dashboard/summary/active-sites?${scopeQuery}`,
    },
    {
      id: "overdue-bills",
      label: "Overdue Bills",
      value: String(overdueBills),
      helperText: "Past due date",
      icon: InvoiceIcon,
      href: `/dashboard/summary/overdue-bills?${scopeQuery}`,
    },
    {
      id: "stock-alerts",
      label: "Stock Alerts",
      value: String(lowStockItems),
      helperText: "Low / out of stock",
      icon: WarningIcon,
      href: `/dashboard/summary/stock-alerts?${scopeQuery}`,
    },
    {
      id: "pending-approvals",
      label: "Pending Approvals",
      value: String(pendingApprovals),
      helperText: "Submitted / sent back",
      icon: ClipboardTextIcon,
      href: `/dashboard/summary/pending-approvals?${scopeQuery}`,
    },
    {
      id: "billing-pending",
      label: "Billing Pending",
      value: money(billingPending),
      helperText: "Receivable amount",
      icon: InvoiceIcon,
      href: `/dashboard/summary/billing-pending?${periodQuery}`,
    },
    {
      id: "monthly-expenses",
      label: "Monthly Expenses",
      value: money(monthlyExpenses),
      helperText: "Approved expenses",
      icon: CurrencyInrIcon,
      href: `/dashboard/summary/monthly-expenses?${periodQuery}`,
    },
    {
      id: "dpr-pending",
      label: "DPR Pending",
      value: String(dprPending),
      helperText: "Supervisor submissions",
      icon: CalendarCheckIcon,
      href: `/dashboard/summary/dpr-pending?${periodQuery}`,
    },
    {
      id: "field-updates",
      label: "Field Updates",
      value: String(fieldUpdates),
      helperText: "Site progress logged",
      icon: UsersThreeIcon,
      href: `/dashboard/summary/field-updates?${periodQuery}`,
    },
  ];
}

function buildCustomerMetrics(
  scope: DashboardScope,
  adminStats: Record<string, number> | undefined,
): DashboardMetric[] {
  const metricItems: Array<{
    key: DashboardStatKey;
    label: string;
    helperText: string;
    icon: DashboardMetric["icon"];
  }> = [
    {
      key: "total-customers",
      label: "Total Customers",
      helperText: "Master records",
      icon: UsersThreeIcon,
    },
    {
      key: "survey-done",
      label: "Survey Done",
      helperText: "Survey records",
      icon: ClipboardTextIcon,
    },
    {
      key: "gi-done",
      label: "GI Done",
      helperText: "Installation / report",
      icon: GaugeIcon,
    },
    {
      key: "gc-done",
      label: "GC Done",
      helperText: "GC report / evidence",
      icon: WarningIcon,
    },
    {
      key: "conversion-done",
      label: "Conversion Done",
      helperText: "Customer conversion",
      icon: CalendarCheckIcon,
    },
    {
      key: "jmr-done",
      label: "JMR Done",
      helperText: "Measurement records",
      icon: ClipboardTextIcon,
    },
    {
      key: "gi-bill-done",
      label: "GI Bill Done",
      helperText: "GI invoice completed",
      icon: InvoiceIcon,
    },
    {
      key: "gc-bill-done",
      label: "GC Bill Done",
      helperText: "GC invoice completed",
      icon: InvoiceIcon,
    },
    {
      key: "conversion-bill-done",
      label: "Conversion Bill Done",
      helperText: "Conversion invoice completed",
      icon: InvoiceIcon,
    },
    {
      key: "connection-remark",
      label: "Total Connection Remark",
      helperText: "Sent back / on hold",
      icon: WarningIcon,
    },
    {
      key: "total-pbg-assignment",
      label: "Total PBG Assignment",
      helperText: "JMR submitted in PBG",
      icon: ListChecksIcon,
    },
  ];

  return metricItems.map(({ key, ...metric }) => {
    const statValue = adminStats ? adminStats[key] ?? 0 : 0;
    const totalCustomers = adminStats ? adminStats["total-customers"] ?? 0 : 0;
    const displayValue = key === "total-customers" ? String(statValue) : `${statValue}/${totalCustomers}`;
    
    return {
      ...metric,
      id: key,
      value: displayValue,
      href: `/dashboard/stats/${key}?projectId=${scope.projectId}&city=${encodeURIComponent(scope.city)}`,
    };
  });
}

function buildAttendanceRows(records: AttendanceRecord[]): AttendanceSummaryRow[] {
  const countByStatus = (status: AttendanceRecord["status"]) =>
    records.filter((record) => record.status === status).length;

  return [
    { id: "present", label: "Present", value: countByStatus("Present"), helper: "Marked on site" },
    { id: "late", label: "Late", value: countByStatus("Late"), helper: "Late check-in" },
    { id: "absent", label: "Absent", value: countByStatus("Absent"), helper: "Needs review" },
    { id: "leave", label: "Leave", value: countByStatus("Leave"), helper: "Approved leave" },
  ];
}

function buildAlerts(
  bills: Bill[],
  payments: Payment[],
  customers: Customer[],
  materials: Material[],
  dprRecords: DprRecord[],
): DashboardAlert[] {
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const lowStock = materials.filter((material) => ["Low Stock", "Out of Stock"].includes(material.status));
  const overdueBills = bills.filter((bill) => bill.status === "Overdue");
  const submittedPayments = payments.filter((payment) => payment.status === "Submitted");
  const sentBackSurveys = customers.filter((customer) => customer.survey?.approvalStatus === "Sent Back");
  const submittedDpr = dprRecords.filter((record) => record.status === "Submitted");

  return [
    ...lowStock.map<DashboardAlert>((material) => ({
      id: `stock-${material.id}`,
      title: `${material.name} needs stock attention`,
      description: `${material.currentBalance} ${material.unit} available (reorder at ${material.reorderLevel})`,
      tone: material.status === "Out of Stock" ? "danger" : "warning",
    })),
    ...overdueBills.map<DashboardAlert>((bill) => ({
      id: `bill-${bill.id}`,
      title: `${bill.billNumber} is overdue`,
      description: `${customerById.get(bill.customerId)?.customerConnection.customerName ?? "Customer"} has ${money(bill.pendingAmount)} pending`,
      tone: "danger",
    })),
    ...submittedPayments.map<DashboardAlert>((payment) => ({
      id: `payment-${payment.id}`,
      title: "Expense awaiting approval",
      description: `${payment.paidTo} submitted ${money(payment.amount)} for ${payment.purpose || payment.category}`,
      tone: "warning",
    })),
    ...sentBackSurveys.map<DashboardAlert>((customer) => ({
      id: `survey-${customer.id}`,
      title: "Survey sent back",
      description: `${customer.customerConnection.customerName} needs field correction`,
      tone: "warning",
    })),
    ...submittedDpr.map<DashboardAlert>((record) => ({
      id: `dpr-${record.id}`,
      title: "DPR awaiting admin review",
      description: `${record.evidence.length} photos submitted for ${record.siteLabel}`,
      tone: "info",
    })),
  ].slice(0, 6);
}

export function getActiveSites(projectSites: ProjectSite[], { city }: Pick<DashboardScope, "city">) {
  return projectSites.filter((site) => {
    const cityMatch = city === "all" || site.city === city;
    return cityMatch && site.status !== "Not Started";
  });
}

function getActiveSiteCount(projectSites: ProjectSite[], scope: DashboardScope) {
  return getActiveSites(projectSites, scope).length;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
