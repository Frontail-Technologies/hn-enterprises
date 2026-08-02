import {
  ArrowClockwiseIcon,
  ArrowsLeftRightIcon,
  EyeIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import type { Material } from "../../types/material.types";
import { ActionLink } from "../shared/ActionLink";
import { MaterialDrawer } from "./MaterialDrawer";

export function InventoryActions({
  material,
  labels = false,
}: {
  material: Material;
  labels?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <ActionLink
        href={`/inventory/${material.id}`}
        label="View"
        icon={<EyeIcon size={15} />}
        labels={labels}
      />
      <MaterialDrawer type="purchase" triggerLabel="Add Purchase" icon={<PlusIcon size={15} />} iconOnly={!labels} />
      <MaterialDrawer type="issue" triggerLabel="Issue Material" icon={<UploadSimpleIcon size={15} />} iconOnly={!labels} />
      <MaterialDrawer type="return" triggerLabel="Return Material" icon={<ArrowClockwiseIcon size={15} />} iconOnly={!labels} />
      <MaterialDrawer type="adjustment" triggerLabel="Adjust Balance" icon={<ArrowsLeftRightIcon size={15} />} iconOnly={!labels} />
    </div>
  );
}
