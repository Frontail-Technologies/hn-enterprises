"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { MaintenanceCard } from "./MaintenanceCard";

/** App-wide settings for admins. */
export function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" />
      <div className="max-w-3xl">
        <MaintenanceCard />
      </div>
    </div>
  );
}
