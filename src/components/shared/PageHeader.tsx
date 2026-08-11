import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Optional small line above the title (e.g. breadcrumb-style context). */
  eyebrow?: ReactNode
  /** Page-specific actions, right-aligned; wraps on narrow widths. */
  actions?: ReactNode
  className?: string
}

/**
 * The single canonical page header for the admin dashboard.
 * Spec: title 20px/semibold, subtitle 13px/regular muted, right-aligned actions.
 * `PageShell` renders this internally so both share one implementation.
 */
export function PageHeader({ title, subtitle, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-xs text-muted-foreground">{eyebrow}</div> : null}
        <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
