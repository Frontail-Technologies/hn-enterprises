export type DashboardOverviewMetric = {
  id: string;
  label: string;
  value: string;
  helperText: string;
  href?: string;
};

export type DashboardOverviewAttendanceRow = {
  id: string;
  label: string;
  value: number;
  helper: string;
};

export type DashboardOverviewAlertTone = "warning" | "danger" | "info";

export type DashboardOverviewAlert = {
  id: string;
  title: string;
  description: string;
  tone: DashboardOverviewAlertTone;
};

export type DashboardActivityType = "Work" | "Survey" | "DPR" | "Billing" | "System";

export type DashboardOverviewActivity = {
  id: string;
  title: string;
  type: DashboardActivityType;
  dateTime: string;
};

export type DashboardOverviewProject = {
  id: string;
  name: string;
};

export type DashboardOverviewResponse = {
  filters: { projects: DashboardOverviewProject[] };
  metrics: DashboardOverviewMetric[];
  attendance: DashboardOverviewAttendanceRow[];
  alerts: DashboardOverviewAlert[];
  recentActivity: DashboardOverviewActivity[];
};

export type DashboardPeriod = "today" | "this-month" | "this-year" | "custom-month" | "custom-year";

export type DashboardOverviewParams = {
  projectId: string;
  period: DashboardPeriod;
  month?: string;
  year?: string;
};

/** GET /dashboard/charts — same filters as the overview. */
export type DashboardChartsResponse = {
  period: { from: string; to: string };
  /** All-time customers through each field stage. */
  pipeline: { total: number; stages: { key: string; label: string; done: number }[] };
  /** Field updates per bucket ("YYYY-MM-DD"; month buckets use the 1st) split by work stage. */
  fieldTrend: {
    unit: "day" | "month";
    stages: string[];
    points: { bucket: string; total: number; byStage: Record<string, number> }[];
  };
  /** Approved expenses in the period, largest first. */
  expensesByCategory: { category: string; amount: number }[];
  /** Billed (bill date) vs collected (payment date) per month of `year`. */
  billing: { year: number; months: { month: number; billed: number; collected: number }[] };
};
