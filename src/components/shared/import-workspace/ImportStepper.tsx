import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const STEPS = ["Upload file", "Review rows", "Import"];

/** Upload → Review → Import progress; the connector fills as steps complete. */
export function ImportStepper({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Import progress">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                done ? "bg-success text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {done ? <CheckIcon size={13} weight="bold" className="animate-in zoom-in-50 duration-300" /> : index + 1}
            </span>
            <span className={cn("hidden text-[13px] whitespace-nowrap sm:inline", active ? "font-semibold text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="relative mx-1 h-0.5 w-8 overflow-hidden rounded-full bg-border sm:w-12" aria-hidden="true">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-success transition-[width] duration-500 ease-out"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
