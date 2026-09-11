import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  icon?: ElementType
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, icon: Icon, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Icon size={17} weight="bold" />
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <div className="mb-1 text-meta">{eyebrow}</div> : null}
          <h1 className="truncate text-page-title">{title}</h1>
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
