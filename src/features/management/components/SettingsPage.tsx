"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Company profile, workflow defaults and integrations."
      />
      <section className="grid gap-4 xl:grid-cols-3">
        <SettingsPanel
          title="Company Profile"
          items={[
            "Company Name: HN Enterprises",
            "Logo: Default mark",
            "Contact: admin@hn.local",
          ]}
        />
        <SettingsPanel
          title="System Settings"
          items={[
            "Notifications: Enabled",
            "Workflow defaults: Standard CGD",
            "Date format: dd MMM yyyy",
          ]}
        />
        <SettingsPanel
          title="Integration Settings"
          items={[
            "Maps: OpenStreetMap",
            "SMS: Configured",
            "Storage: Local mock",
          ]}
        />
      </section>
    </div>
  );
}

function SettingsPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-lg bg-muted/30 px-3 py-2 text-sm font-medium text-foreground"
          >
            {item}
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-3">
        Edit
      </Button>
    </section>
  );
}
