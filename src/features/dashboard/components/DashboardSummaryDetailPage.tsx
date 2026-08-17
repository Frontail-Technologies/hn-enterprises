import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import type { AdminSummaryStatKey } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { ActiveSitesSummaryDetail } from "./summary/ActiveSitesSummaryDetail";
import { BillingPendingSummaryDetail } from "./summary/BillingPendingSummaryDetail";
import { DprPendingSummaryDetail } from "./summary/DprPendingSummaryDetail";
import { FieldUpdatesSummaryDetail } from "./summary/FieldUpdatesSummaryDetail";
import { MonthlyExpensesSummaryDetail } from "./summary/MonthlyExpensesSummaryDetail";
import { OverdueBillsSummaryDetail } from "./summary/OverdueBillsSummaryDetail";
import { PendingApprovalsSummaryDetail } from "./summary/PendingApprovalsSummaryDetail";
import { StockAlertsSummaryDetail } from "./summary/StockAlertsSummaryDetail";
import { TotalProjectsSummaryDetail } from "./summary/TotalProjectsSummaryDetail";

export function DashboardSummaryDetailPage({
  statKey,
  projectId = "all",
  city = "all",
  period = "this-month",
}: {
  statKey: AdminSummaryStatKey;
  projectId?: string;
  city?: string;
  period?: DashboardMetricPeriod;
}) {
  if (statKey === "total-projects") {
    return <TotalProjectsSummaryDetail projectId={projectId} city={city} />;
  }
  if (statKey === "active-sites") {
    return <ActiveSitesSummaryDetail city={city} />;
  }
  if (statKey === "overdue-bills") {
    return <OverdueBillsSummaryDetail projectId={projectId} />;
  }
  if (statKey === "field-updates") {
    return <FieldUpdatesSummaryDetail period={period} />;
  }
  if (statKey === "stock-alerts") {
    return <StockAlertsSummaryDetail />;
  }
  if (statKey === "pending-approvals") {
    return <PendingApprovalsSummaryDetail projectId={projectId} city={city} />;
  }
  if (statKey === "billing-pending") {
    return <BillingPendingSummaryDetail projectId={projectId} period={period} />;
  }
  if (statKey === "monthly-expenses") {
    return <MonthlyExpensesSummaryDetail projectId={projectId} city={city} period={period} />;
  }
  return <DprPendingSummaryDetail period={period} />;
}
