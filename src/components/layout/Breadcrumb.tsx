'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { CaretRightIcon as CaretRight } from '@phosphor-icons/react'

import { ROUTE_LABELS } from '@/constants/navigation'

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/')
    const label = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
    const isLast = idx === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
      {crumbs.map((crumb, idx) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {idx > 0 && (
            <CaretRight
              aria-hidden="true"
              size={13}
              weight="bold"
              className="shrink-0 text-muted-foreground/70"
            />
          )}
          {crumb.isLast ? (
            <span className="text-foreground font-semibold truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-primary transition-colors truncate max-w-[160px]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
