'use client'

import { BellIcon as Bell, ListIcon as List } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Breadcrumb } from './Breadcrumb'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuth()

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U'

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
        aria-label="Toggle sidebar"
      >
        <List size={18} weight="bold" />
      </Button>

      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Notification dot — uses primary brand color */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-card" />
        </Button>

        {/* User display */}
        <div className="hidden sm:flex items-center gap-1.5 pl-2 ml-1 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
          <div className="hidden md:flex flex-col leading-none">
            <span className="text-xs font-semibold text-foreground">{user?.fullName}</span>
            <span className="text-[10px] text-muted-foreground capitalize">
              {user?.role.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
