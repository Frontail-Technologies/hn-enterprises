import type { ReactNode } from "react";
import { DrawerShell } from "@/components/shared/DrawerShell";
import { QuickField } from "@/components/shared/QuickField";
import { materials } from "../../data/materials.data";
import { ImageProofField } from "../shared/ImageProofField";

export function MaterialDrawer({
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
      description="Maintain stock movement with receipt/photo reference."
      triggerLabel={action}
      icon={icon}
      iconOnly={iconOnly}
    >
      <QuickField
        label="Material"
        select
        options={materials.map((row) => row.name)}
      />
      <QuickField label="Project / Site" />
      <QuickField label="Quantity" />
      <QuickField label="Transaction Date" date />
      <ImageProofField
        label="Bill / Receipt Photo"
        description="Upload material bill, store receipt or handover proof image."
      />
      <QuickField label="Remarks" textarea />
    </DrawerShell>
  );
}
