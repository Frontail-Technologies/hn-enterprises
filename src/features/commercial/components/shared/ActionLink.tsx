import type { ReactNode } from "react";
import Link from "next/link";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { buttonVariants } from "@/components/ui/button";

export function ActionLink({
  href,
  label,
  icon,
  labels = false,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  labels?: boolean;
}) {
  return (
    <ActionTooltip label={label}>
      <Link
        href={href}
        className={buttonVariants({
          variant: "ghost",
          size: labels ? "sm" : "icon-sm",
        })}
        aria-label={label}
      >
        {icon}
        {labels ? label : null}
      </Link>
    </ActionTooltip>
  );
}
