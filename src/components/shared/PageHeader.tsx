'use client'

import type { ElementType, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PageIcon, pageIconForPath, type PageIconName } from './PageIcon'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  /** Section icon beside the title; defaults to the icon for the current URL section. `false` hides it. */
  iconName?: PageIconName | false
  /** Kept for API compatibility; the section icon comes from `iconName` / the URL. */
  icon?: ElementType
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, iconName, eyebrow, actions, className }: PageHeaderProps) {
  const pathname = usePathname()
  const name = iconName === false ? null : (iconName ?? pageIconForPath(pathname))

  return (
    <div
      className={cn(
        'flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        {name ? <PageIcon name={name} /> : null}
        <div className="flex min-w-0 flex-col gap-1">
          {eyebrow ? (
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
          ) : null}
          <h1 className="truncate text-page-title">{title}</h1>
          {/* Sub-labels are not shown anywhere (design decision): the prop stays so callers keep compiling. */}
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
