import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useDashboardOverviewQuery } from "@/features/dashboard/queries/useDashboardOverviewQuery";
import { useDashboardPreferencesStore } from "@/features/dashboard/store/dashboard-preferences.store";
import { METRIC_ICON_BY_ID, DEFAULT_METRIC_ICON } from "@/features/dashboard/data/dashboard-metric-icons";
import type { DashboardPeriod } from "@/features/dashboard/model/dashboard-overview.types";

const PERIOD_VALUES = ["today", "this-month", "this-year", "custom-month", "custom-year"] as const;

export function useDashboardScreen() {
  const [projectId, setProjectId] = useQueryState("project", parseAsString.withDefault("all"));
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(PERIOD_VALUES).withDefault("this-month"),
  );
  const [month, setMonth] = useQueryState("month", parseAsString.withDefault(""));
  const [year, setYear] = useQueryState("year", parseAsString.withDefault(""));

  const overviewQuery = useDashboardOverviewQuery({
    projectId,
    period,
    month: period === "custom-month" ? month || undefined : undefined,
    year: period === "custom-year" || period === "custom-month" ? year || undefined : undefined,
  });
  const overview = overviewQuery.data;

  const selectedMetricIds = useDashboardPreferencesStore((state) => state.selectedMetricIds);
  const hasCustomized = useDashboardPreferencesStore((state) => state.hasCustomized);
  const setSelectedMetricIds = useDashboardPreferencesStore((state) => state.setSelectedMetricIds);

  const allMetrics = (overview?.metrics ?? []).map((metric) => ({
    ...metric,
    icon: METRIC_ICON_BY_ID[metric.id] ?? DEFAULT_METRIC_ICON,
  }));

  const effectiveMetricIds =
    selectedMetricIds.length > 0 || hasCustomized ? selectedMetricIds : allMetrics.map((metric) => metric.id);

  const visibleMetrics = allMetrics.filter((metric) => effectiveMetricIds.includes(metric.id));

  function setPeriodValue(next: DashboardPeriod) {
    void setPeriod(next);
    if (next !== "custom-month" && next !== "custom-year") {
      void setMonth(null);
      void setYear(null);
    }
  }

  return {
    filters: { projectId, period, month, year },
    setProjectId,
    setPeriod: setPeriodValue,
    setMonth,
    setYear,
    overview,
    isLoading: overviewQuery.isLoading,
    isFetching: overviewQuery.isFetching,
    isError: overviewQuery.isError,
    refetch: overviewQuery.refetch,
    allMetrics,
    visibleMetrics,
    effectiveMetricIds,
    setSelectedMetricIds,
  };
}
