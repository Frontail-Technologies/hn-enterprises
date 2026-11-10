import type { ElementType } from "react";
import { DashboardStatCard } from "./DashboardStatCard";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  helperText?: string;
  className?: string;
  iconClassName?: string;
}

/** Kept for existing call sites; renders the shared stat-card look. */
export function MetricCard(props: MetricCardProps) {
  return <DashboardStatCard tone="primary" {...props} />;
}
