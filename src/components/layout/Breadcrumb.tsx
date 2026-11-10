'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { CaretRightIcon as CaretRight } from '@phosphor-icons/react'

import { ROUTE_LABELS } from '@/constants/navigation'
import { useBreadcrumbLabels } from './BreadcrumbLabelContext'

export function Breadcrumb() {
  const pathname = usePathname()
  const labelOverrides = useBreadcrumbLabels()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/')
    const isLast = idx === segments.length - 1
    const label =
      labelOverrides[seg] ?? ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
    return { href, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] md:flex">
      {crumbs.map((crumb, idx) => (
        <span key={crumb.href} className="flex min-w-0 items-center gap-1.5">
          {idx > 0 && (
            <CaretRight aria-hidden="true" size={12} className="shrink-0 text-muted-foreground/60" />
          )}
          {crumb.isLast ? (
            <span aria-current="page" className="max-w-60 truncate font-semibold text-foreground">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="max-w-45 truncate text-muted-foreground transition-colors hover:text-foreground"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
