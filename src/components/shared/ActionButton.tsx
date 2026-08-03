import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { cn } from "@/lib/utils";

export function ActionButton({
  label,
  icon,
  labels = false,
  href,
  download,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: ReactNode;
  labels?: boolean;
  href?: string;
  download?: string | boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const className = cn(
    buttonVariants({ variant: "ghost", size: labels ? "sm" : "icon-sm" }),
    disabled && "pointer-events-none opacity-50",
  );

  if (href) {
    return (
      <ActionTooltip label={label}>
        <a
          href={href}
          target={download ? undefined : "_blank"}
          rel="noopener noreferrer"
          download={download}
          className={className}
          aria-label={label}
        >
          {icon}
          {labels ? label : null}
        </a>
      </ActionTooltip>
    );
  }

  return (
    <ActionTooltip label={label}>
      <button type="button" className={className} aria-label={label} onClick={onClick} disabled={disabled}>
        {icon}
        {labels ? label : null}
      </button>
    </ActionTooltip>
  );
}
