import {
  ArrowClockwiseIcon,
  ArrowsLeftRightIcon,
  EyeIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { getMaterialByName } from "../../utils/inventory.utils";
import { ActionLink } from "../shared/ActionLink";
import { MaterialDrawer } from "./MaterialDrawer";

export function InventoryActions({
  material,
  labels = false,
}: {
  material: string;
  labels?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <ActionLink
        href={`/inventory/${getMaterialByName(material).id}`}
        label="View"
        icon={<EyeIcon size={15} />}
        labels={labels}
      />
      <MaterialDrawer
        action="Add Stock"
        icon={<PlusIcon size={15} />}
        iconOnly={!labels}
      />
      <MaterialDrawer
        action="Issue Material"
        icon={<UploadSimpleIcon size={15} />}
        iconOnly={!labels}
      />
      <MaterialDrawer
        action="Return Material"
        icon={<ArrowClockwiseIcon size={15} />}
        iconOnly={!labels}
      />
      <MaterialDrawer
        action="Transfer Material"
        icon={<ArrowsLeftRightIcon size={15} />}
        iconOnly={!labels}
      />
    </div>
  );
}
