import type { ReactNode } from "react";
import { PageHeader } from "@/components/shared/PageHeader";

export function PageShell({
  title,
  subtitle,
  actions,
  tabs,
  hideTitle = false,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  tabs?: ReactNode;
  hideTitle?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {hideTitle ? (
        actions ? (
          <div className="flex justify-end">{actions}</div>
        ) : null
      ) : (
        <PageHeader title={title} subtitle={subtitle} actions={actions} />
      )}
      {tabs ? <div className="border-b border-border">{tabs}</div> : null}
      <section className="space-y-3 rounded-card border border-border bg-card p-4">
        {children}
      </section>
    </div>
  );
}
