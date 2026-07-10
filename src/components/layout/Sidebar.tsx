'use client'

import {
  SquaresFour, Buildings, Users, ClipboardText, CalendarBlank, ChartBar,
  FolderOpen, Wrench, Gauge, FileText, ChartPieSlice, CheckSquare, Package,
  Receipt, CurrencyInr, UsersThree, Folder, UserGear, Database, Gear,
  ClockCounterClockwise, House, SignOut, User, Lock, CaretUpDown,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { NAV_ITEMS } from '@/constants/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { NavItem } from '@/types/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ICON_MAP: Record<string, React.ElementType> = {
  SquaresFour, Buildings, Users, ClipboardText, CalendarBlank, ChartBar,
  FolderOpen, Wrench, Gauge, FileText, ChartPieSlice, CheckSquare, Package,
  Receipt, CurrencyInr, UsersThree, Folder, UserGear, Database, Gear,
  ClockCounterClockwise,
}

interface SidebarProps {
  collapsed: boolean
}

function NavLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const IconComponent = ICON_MAP[item.icon]

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {IconComponent && (
        <IconComponent
          size={20}
          weight={active ? 'fill' : 'regular'}
          className={cn(
            'shrink-0',
            active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
          )}
        />
      )}
      {!collapsed && (
        <span className="truncate leading-none">{item.label}</span>
      )}
      {!collapsed && item.badge != null && item.badge > 0 && (
        <span className="ml-auto text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5 font-semibold leading-none">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true
    return user ? item.allowedRoles.includes(user.role) : false
  })

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U'

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen bg-card border-r border-border flex flex-col z-40 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 border-b border-border shrink-0',
        collapsed ? 'px-3 justify-center' : 'px-4 gap-2.5'
      )}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <House size={18} weight="fill" className="text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground tracking-tight">HN Enterprises</span>
            <span className="text-[10px] text-muted-foreground font-medium">CGD Management</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return <NavLink key={item.id} item={item} collapsed={collapsed} active={active} />
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left outline-none',
              collapsed && 'justify-center'
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{user?.fullName}</p>
                  <p className="text-[10px] text-muted-foreground truncate capitalize">
                    {user?.role.replace(/_/g, ' ')}
                  </p>
                </div>
                <CaretUpDown size={14} className="text-muted-foreground shrink-0" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role.replace(/_/g, ' ')}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/profile" className="flex items-center gap-2 w-full">
                <User size={14} /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/change-password" className="flex items-center gap-2 w-full">
                <Lock size={14} /> Change Password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <SignOut size={14} /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
