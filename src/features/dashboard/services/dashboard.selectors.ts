import {
  CalendarCheckIcon,
  ClipboardTextIcon,
  CurrencyInrIcon,
  FolderOpenIcon,
  GaugeIcon,
  InvoiceIcon,
  UsersThreeIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { bills } from "@/features/commercial/data/bills.data";
import { materials } from "@/features/commercial/data/materials.data";
import { payments } from "@/features/commercial/data/payments.data";
import { customers } from "@/features/customers/services/customers.mock";
import { buildAttendanceRecords } from "@/features/management/data/attendance.data";
import { planningDprRecords } from "@/features/planning/services/planning.service";
import { projects, projectSites } from "@/features/projects/services/projects.mock";
import type {
  DashboardMetric,
  DashboardMetricPeriod,
} from "@/features/dashboard/data/dashboard.data";
import {
  type DashboardStatKey,
  getDashboardStatValue,
} from "@/features/dashboard/services/dashboard-stats.service";

export type DashboardWorkflowMetric = DashboardMetric & {
  key: DashboardStatKey;
};

export type DashboardScope = {
  projectId: string;
  city: string;
  period: DashboardMetricPeriod;
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

export const dashboardProjectOptions = projects.map((project) => ({
  label: `${project.code} - ${project.name}`,
  value: project.id,
}));

export const dashboardCityOptions = Array.from(
  new Set(projects.map((project) => project.city)),
).map((city) => ({ label: city, value: city }));

export function getAdminDashboardData(scope: DashboardScope) {
  const scopedProjects = getScopedProjects(scope);
  const scopedCustomers = getScopedCustomers(scope);
  const scopedProjectNames = new Set(scopedProjects.map((project) => project.name));
  const scopedBills = bills.filter(
    (bill) =>
      scopedProjectNames.has(bill.projectCustomer) ||
      scopedCustomers.some(
        (customer) =>
          customer.id === bill.customerId ||
          customer.customerConnection.customerName === bill.projectCustomer,
      ),
  );
  const visibleBills = scopedBills.length ? scopedBills : bills;
  const visiblePayments = payments.filter((payment) =>
    scope.city === "all"
      ? true
      : payment.projectSite.toLowerCase().includes(scope.city.toLowerCase()),
  );
  const metrics = buildAdminMetrics({
    projectsCount: scopedProjects.length,
    activeSites: getActiveSiteCount(scope),
    customers: scopedCustomers,
    bills: visibleBills,
    payments: visiblePayments.length ? visiblePayments : payments,
    periodFactor: getPeriodFactor(scope.period),
  });
  const workflowMetrics = buildWorkflowMetrics({
    customers: scopedCustomers,
    scope,
  });

  return {
    metrics,
    workflowMetrics,
    attendanceRows: buildAttendanceRows(),
    alerts: buildAlerts(visibleBills, visiblePayments.length ? visiblePayments : payments, scopedCustomers),
  };
}

function getScopedProjects({ projectId, city }: DashboardScope) {
  return projects.filter((project) => {
    const projectMatch = projectId === "all" || project.id === projectId;
    const cityMatch = city === "all" || project.city === city;
    return projectMatch && cityMatch;
  });
}

function getScopedCustomers({ projectId, city }: DashboardScope) {
  return customers.filter((customer) => {
    const projectMatch = projectId === "all" || customer.projectId === projectId;
    const cityMatch = city === "all" || customer.city === city;
    return projectMatch && cityMatch;
  });
}

function buildAdminMetrics({
  projectsCount,
  activeSites,
  customers: scopedCustomers,
  bills: scopedBills,
  payments: scopedPayments,
  periodFactor,
}: {
  projectsCount: number;
  activeSites: number;
  customers: typeof customers;
  bills: typeof bills;
  payments: typeof payments;
  periodFactor: number;
}): DashboardMetric[] {
  const totalCustomers = scopedCustomers.length;
  const lowStockItems = materials.filter((material) =>
    ["Low Stock", "Out of Stock"].includes(material.status),
  ).length;
  const pendingApprovals =
    scopedCustomers.filter((customer) =>
      ["Submitted", "In Review", "Sent Back"].includes(customer.survey?.approvalStatus ?? ""),
    ).length +
    scopedPayments.filter((payment) => payment.status === "Submitted").length +
    scopedBills.filter((bill) => bill.status === "Submitted").length;
  const billingPending = scopedBills.reduce((sum, bill) => sum + bill.pendingAmount, 0);
  const monthlyExpenses = scopedPayments
    .filter((payment) => payment.status === "Approved")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const dprPending = planningDprRecords.filter((record) => record.status !== "Approved").length;

  return [
    {
      label: "Total Projects",
      value: String(scaleCount(projectsCount, periodFactor)),
      helperText: "Across selected scope",
      icon: FolderOpenIcon,
    },
    {
      label: "Active Sites",
      value: String(scaleCount(activeSites, periodFactor)),
      helperText: "Field locations",
      icon: GaugeIcon,
    },
    {
      label: "Total Customers",
      value: String(scaleCount(totalCustomers, periodFactor)),
      helperText: "Master records",
      icon: UsersThreeIcon,
    },
    {
      label: "Stock Alerts",
      value: String(lowStockItems),
      helperText: "Low / out of stock",
      icon: WarningIcon,
    },
    {
      label: "Pending Approvals",
      value: String(scaleCount(pendingApprovals, periodFactor)),
      helperText: "Submitted / sent back",
      icon: ClipboardTextIcon,
    },
    {
      label: "Billing Pending",
      value: money(billingPending * periodFactor),
      helperText: "Receivable amount",
      icon: InvoiceIcon,
    },
    {
      label: "Monthly Expenses",
      value: money(monthlyExpenses * periodFactor),
      helperText: "Approved expenses",
      icon: CurrencyInrIcon,
    },
    {
      label: "DPR Pending",
      value: String(scaleCount(dprPending, periodFactor)),
      helperText: "Supervisor submissions",
      icon: CalendarCheckIcon,
    },
  ];
}

function buildWorkflowMetrics({
  customers: scopedCustomers,
  scope,
}: {
  customers: typeof customers;
  scope: DashboardScope;
}): DashboardWorkflowMetric[] {
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
      key: "billing-done",
      label: "Billing Done",
      helperText: "GI / GC / conversion",
      icon: InvoiceIcon,
    },
    {
      key: "pending-rework",
      label: "Pending Rework",
      helperText: "Sent back / on hold",
      icon: WarningIcon,
    },
  ];

  return metricItems.map((metric) => ({
    ...metric,
    value: getDashboardStatValue(metric.key, scopedCustomers),
    href: `/dashboard/stats/${metric.key}?projectId=${scope.projectId}&city=${encodeURIComponent(scope.city)}`,
  }));
}

function buildAttendanceRows(): AttendanceSummaryRow[] {
  const records = buildAttendanceRecords(new Date(2026, 6, 1));
  const count = (status: string) =>
    records.filter((record) => record.status === status).length;

  return [
    { id: "present", label: "Present", value: count("Present"), helper: "Marked on site" },
    { id: "late", label: "Late", value: count("Late"), helper: "Late check-in" },
    { id: "absent", label: "Absent", value: count("Absent"), helper: "Needs review" },
    { id: "leave", label: "Leave", value: count("Leave"), helper: "Approved leave" },
  ];
}

function buildAlerts(
  scopedBills: typeof bills,
  scopedPayments: typeof payments,
  scopedCustomers: typeof customers,
): DashboardAlert[] {
  const lowStock = materials.filter((material) =>
    ["Low Stock", "Out of Stock"].includes(material.status),
  );
  const overdueBills = scopedBills.filter((bill) => bill.status === "Overdue");
  const submittedPayments = scopedPayments.filter((payment) => payment.status === "Submitted");
  const sentBackSurveys = scopedCustomers.filter(
    (customer) => customer.survey?.approvalStatus === "Sent Back",
  );
  const submittedDpr = planningDprRecords.filter((record) => record.status === "Submitted");

  return [
    ...lowStock.map<DashboardAlert>((material) => ({
      id: `stock-${material.id}`,
      title: `${material.name} needs stock attention`,
      description: `${material.availableStock} ${material.unit} available at ${material.store}`,
      tone: material.status === "Out of Stock" ? "danger" : "warning",
    })),
    ...overdueBills.map<DashboardAlert>((bill) => ({
      id: `bill-${bill.id}`,
      title: `${bill.billNumber} is overdue`,
      description: `${bill.projectCustomer} has ${money(bill.pendingAmount)} pending`,
      tone: "danger",
    })),
    ...submittedPayments.map<DashboardAlert>((payment) => ({
      id: `payment-${payment.id}`,
      title: "Expense awaiting approval",
      description: `${payment.submittedBy} submitted ${money(payment.amount)} for ${payment.site}`,
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
      description: `${record.photoCount} photos submitted for ${record.siteAddress}`,
      tone: "info",
    })),
  ].slice(0, 6);
}

function getActiveSiteCount(scope: DashboardScope) {
  return projectSites.filter((site) => {
    const cityMatch = scope.city === "all" || site.city === scope.city;
    return cityMatch && site.status !== "Not Started";
  }).length;
}

function getPeriodFactor(period: DashboardMetricPeriod) {
  if (period === "today") return 0.2;
  if (period === "this-year") return 3;
  return 1;
}

function scaleCount(value: number, factor: number) {
  if (!value) return 0;
  return Math.max(1, Math.round(value * factor));
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
