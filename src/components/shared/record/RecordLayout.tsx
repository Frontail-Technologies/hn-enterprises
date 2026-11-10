import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Main column plus a narrower right rail for facts/summary; stacks below xl. */
export function RecordLayout({ rail, children, className }: { rail: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]", className)}>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
      <aside className="flex min-w-0 flex-col gap-5">{rail}</aside>
    </div>
  );
}
