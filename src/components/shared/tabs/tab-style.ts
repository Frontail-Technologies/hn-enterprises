import { cn } from "@/lib/utils";

export const tabRowClassName = "flex min-w-0 flex-wrap items-center gap-1 border-b border-border";

export function tabItemClassName(active: boolean) {
  return cn(
    "relative inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-t-md border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
    active
      ? "border-b-primary bg-primary-soft text-primary font-semibold"
      : "border-b-transparent text-muted-foreground hover:bg-surface-hover hover:text-foreground",
  );
}
