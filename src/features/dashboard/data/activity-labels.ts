import type { DashboardActivityType } from "@/features/dashboard/model/dashboard-overview.types";

const ACTION_LABEL_OVERRIDES: Record<string, string> = {
  login_failed: "Login failed",
  login_success: "Login successful",
  logout: "Logged out",
  password_reset: "Password reset",
  password_reset_requested: "Password reset requested",
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  approved: "Approved",
  rejected: "Rejected",
};

function humanizeWords(value: string) {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function humanizeActivityTitle(title: string, type: DashboardActivityType) {
  if (type !== "System") return title;

  const separatorIndex = title.indexOf(" - ");
  if (separatorIndex === -1) return humanizeWords(title);

  const action = title.slice(separatorIndex + 3).trim();
  const key = action.toLowerCase().replace(/\s+/g, "_");
  return ACTION_LABEL_OVERRIDES[key] ?? humanizeWords(action);
}
