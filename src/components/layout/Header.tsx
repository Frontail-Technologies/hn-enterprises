'use client'

import Link from 'next/link'
import {
  BuildingsIcon as Buildings,
  CaretDownIcon as CaretDown,
  PlusIcon as Plus,
  SidebarSimpleIcon as SidebarSimple,
  UsersIcon as Users,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import { Breadcrumb } from './Breadcrumb'

const QUICK_ADD = [
  { href: '/customers/new', label: 'New customer', icon: Users },
  { href: '/projects/new', label: 'New project', icon: Buildings },
] as const

/** Desktop top bar. Mobile uses MobileNavbar / MobileNestedHeader instead. */
export function Header() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="app-titlebar app-titlebar-pad sticky top-0 z-30 hidden h-14 shrink-0 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur md:flex lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
        title="Toggle sidebar (Ctrl+B)"
      >
        <SidebarSimple size={19} />
      </Button>
      <span className="h-5 w-px bg-border" aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <Breadcrumb />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="compact" />}>
          <Plus size={14} weight="bold" />
          Quick add
          <CaretDown size={12} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {QUICK_ADD.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={href} render={<Link href={href} />}>
              <Icon size={15} />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
