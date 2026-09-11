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
