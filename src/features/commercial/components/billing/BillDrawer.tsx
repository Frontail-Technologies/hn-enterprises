import type { ReactNode } from "react";
import { DrawerShell } from "@/components/shared/DrawerShell";
import { QuickField } from "@/components/shared/QuickField";

export function BillDrawer({
  action,
  icon,
  iconOnly = false,
}: {
  action: string;
  icon?: ReactNode;
  iconOnly?: boolean;
}) {
  return (
    <DrawerShell
      title={action}
      description="Create bill records and payment entries."
      triggerLabel={action}
      icon={icon}
      iconOnly={iconOnly}
    >
      <QuickField label="Project / Customer" />
      <QuickField
        label="Billing Stage"
        select
        options={["GI", "GC", "Commissioning", "Conversion", "Other"]}
      />
      <QuickField label="Total Amount" />
      <QuickField label="Tax" />
      <QuickField label="Due Date" date />
      <QuickField label="Invoice / PDF" />
      <QuickField label="Remarks" textarea />
    </DrawerShell>
  );
}
