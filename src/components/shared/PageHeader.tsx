import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, eyebrow, actions, className }: PageHeaderProps) {
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
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
