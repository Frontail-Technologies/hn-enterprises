import { WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ImportFieldError } from "./types";

/** Compact row-level summary for the preview table - all messages joined,
 * truncated with a title tooltip for the full text. */
export function ImportErrorSummary({
  errors,
  warnings,
  className,
}: {
  errors: ImportFieldError[];
  warnings: ImportFieldError[];
  className?: string;
}) {
  if (!errors.length && !warnings.length) return <span className="text-muted-foreground">—</span>;

  const items = errors.length ? errors : warnings;
  const text = items.map((item) => item.message).join(" · ");
  const Icon = errors.length ? XCircleIcon : WarningCircleIcon;

  return (
    <span
      title={text}
      className={cn(
        "flex items-start gap-1.5 text-xs",
        errors.length ? "text-destructive" : "text-status-warning-fg",
        className,
      )}
    >
      <Icon size={14} className="mt-0.5 shrink-0" />
      <span className="line-clamp-2">{text}</span>
    </span>
  );
}

/** Inline per-field message, for use directly under a form field in the row editor. */
export function ImportFieldErrorText({ errors, field }: { errors: ImportFieldError[]; field: string }) {
  const message = errors.find((error) => error.field === field)?.message;
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}
