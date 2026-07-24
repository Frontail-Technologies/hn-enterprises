import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";

export function ActionButton({
  label,
  icon,
  labels = false,
}: {
  label: string;
  icon: ReactNode;
  labels?: boolean;
}) {
  return (
    <ActionTooltip label={label}>
      <button
        type="button"
        className={buttonVariants({
          variant: "ghost",
          size: labels ? "sm" : "icon-sm",
        })}
        aria-label={label}
      >
        {icon}
        {labels ? label : null}
      </button>
    </ActionTooltip>
  );
}
