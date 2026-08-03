import type { ReactNode } from "react";

export function TableSection({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-border/70 bg-card p-3">
      {children}
    </section>
  );
}
