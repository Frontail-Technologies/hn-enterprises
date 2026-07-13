'use client'

import { useState } from 'react'
import {
  SquaresFourIcon as SquaresFour, BuildingsIcon as Buildings, UsersIcon as Users,
  ClipboardTextIcon as ClipboardText, CalendarBlankIcon as CalendarBlank,
  ChartBarIcon as ChartBar, FolderOpenIcon as FolderOpen, WrenchIcon as Wrench,
  GaugeIcon as Gauge, FileTextIcon as FileText, ChartPieSliceIcon as ChartPieSlice,
  CheckSquareIcon as CheckSquare, PackageIcon as Package, ReceiptIcon as Receipt,
  CurrencyInrIcon as CurrencyInr, UsersThreeIcon as UsersThree, FolderIcon as Folder,
  UserGearIcon as UserGear, DatabaseIcon as Database, GearIcon as Gear,
  ClockCounterClockwiseIcon as ClockCounterClockwise, HouseIcon as House,
  SignOutIcon as SignOut, UserIcon as User, LockIcon as Lock,
  CaretUpDownIcon as CaretUpDown, CaretDownIcon as CaretDown,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { NAV_ITEMS, NAV_GROUPS } from '@/constants/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { NavItem, NavGroup } from '@/types/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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

const DEFAULT_OPEN_GROUPS: Record<string, boolean> = {
  operations: true,
  commercial: true,
  management: true,
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
      style={active ? { color: '#fff' } : undefined}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-all duration-150 group',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-primary text-white'
          : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {IconComponent && (
        <IconComponent
          size={20}
          weight={active ? 'fill' : 'regular'}
          style={active ? { color: '#fff' } : undefined}
          className={cn(
            'shrink-0',
            active ? 'text-white' : 'text-muted-foreground group-hover:text-accent-foreground'
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

function NavGroupSection({
  group,
  collapsed,
  isOpen,
  onToggle,
  isItemActive,
}: {
  group: NavGroup
  collapsed: boolean
  isOpen: boolean
  onToggle: () => void
  isItemActive: (item: NavItem) => boolean
}) {
  if (collapsed) {
    return (
      <div className="pt-2 mt-2 border-t border-border first:mt-0 first:border-0 first:pt-0 space-y-0.5">
        {group.items.map((item) => (
          <NavLink key={item.id} item={item} collapsed active={isItemActive(item)} />
        ))}
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="pt-1">
      <CollapsibleTrigger className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none">
        <span>{group.label}</span>
        <CaretDown
          size={12}
          className={cn('shrink-0 transition-transform duration-200', !isOpen && '-rotate-90')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 pt-0.5 pb-1">
          {group.items.map((item) => (
            <NavLink key={item.id} item={item} collapsed={false} active={isItemActive(item)} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(DEFAULT_OPEN_GROUPS)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isAllowed = (item: NavItem) => {
    if (!item.allowedRoles) return true
    return user ? item.allowedRoles.includes(user.role) : false
  }

  const isItemActive = (item: NavItem) =>
    pathname === item.href || pathname.startsWith(item.href + '/')

  const visibleTopItems = NAV_ITEMS.filter(isAllowed)
  const visibleGroups = NAV_GROUPS
    .map((group) => ({ ...group, items: group.items.filter(isAllowed) }))
    .filter((group) => group.items.length > 0)

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }))
  }

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U'

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen bg-card border-r border-border/70 flex flex-col z-40 transition-all duration-300 ease-in-out',
        collapsed ? '-translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0 w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-12 border-b border-border/70 shrink-0',
        collapsed ? 'px-3 justify-center' : 'px-4 gap-2.5'
      )}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <House size={18} weight="fill" className="text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground tracking-tight">HN Enterprises</span>
            <span className="text-[10px] text-muted-foreground font-medium">CGD Management</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2.5 space-y-0.5">
        {visibleTopItems.map((item) => (
          <NavLink key={item.id} item={item} collapsed={collapsed} active={isItemActive(item)} />
        ))}

        {visibleGroups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            collapsed={collapsed}
            isOpen={openGroups[group.id] ?? true}
            onToggle={() => toggleGroup(group.id)}
            isItemActive={isItemActive}
          />
        ))}
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
