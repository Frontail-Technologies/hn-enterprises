"use client";

import { useState } from "react";
import {
  SquaresFourIcon as SquaresFour,
  BuildingsIcon as Buildings,
  UsersIcon as Users,
  ClipboardTextIcon as ClipboardText,
  CalendarBlankIcon as CalendarBlank,
  ChartBarIcon as ChartBar,
  FolderOpenIcon as FolderOpen,
  WrenchIcon as Wrench,
  GaugeIcon as Gauge,
  FileTextIcon as FileText,
  ChartPieSliceIcon as ChartPieSlice,
  CheckSquareIcon as CheckSquare,
  PackageIcon as Package,
  ReceiptIcon as Receipt,
  CurrencyInrIcon as CurrencyInr,
  UsersThreeIcon as UsersThree,
  FolderIcon as Folder,
  UserGearIcon as UserGear,
  DatabaseIcon as Database,
  GearIcon as Gear,
  ClockCounterClockwiseIcon as ClockCounterClockwise,
  SignOutIcon as SignOut,
  UserIcon as User,
  LockIcon as Lock,
  CaretUpDownIcon as CaretUpDown,
  CaretDownIcon as CaretDown,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS, NAV_GROUPS } from "@/constants/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NavItem, NavGroup } from "@/types/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICON_MAP: Record<string, React.ElementType> = {
  SquaresFour,
  Buildings,
  Users,
  ClipboardText,
  CalendarBlank,
  ChartBar,
  FolderOpen,
  Wrench,
  Gauge,
  FileText,
  ChartPieSlice,
  CheckSquare,
  Package,
  Receipt,
  CurrencyInr,
  UsersThree,
  Folder,
  UserGear,
  Database,
  Gear,
  ClockCounterClockwise,
};

const DEFAULT_OPEN_GROUPS: Record<string, boolean> = {
  operations: true,
  commercial: true,
  management: true,
};

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const IconComponent = ICON_MAP[item.icon];
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.href} />}
        isActive={active}
        tooltip={collapsed ? item.label : undefined}
        className={cn(
          "h-9 gap-2.5 rounded-sm px-2.5 text-sm font-medium text-sidebar-foreground/82 hover:bg-white/10 hover:text-sidebar-foreground",
          active &&
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground",
        )}
      >
        {IconComponent && (
          <IconComponent
            size={19}
            weight={active ? "fill" : "regular"}
            className={cn(
              "shrink-0",
              active ? "text-primary-foreground" : "text-sidebar-foreground/75",
            )}
          />
        )}
        <span className="truncate leading-none">{item.label}</span>
      </SidebarMenuButton>
      {item.badge != null && item.badge > 0 && (
        <SidebarMenuBadge
          className={cn(
            "text-sidebar-foreground/75",
            active && "text-primary-foreground",
          )}
        >
          {item.badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

function NavGroupSection({
  group,
  isOpen,
  onToggle,
  isItemActive,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  isItemActive: (item: NavItem) => boolean;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (collapsed) {
    return (
      <SidebarGroup className="border-t border-sidebar-border/50 pt-2 first:border-t-0 first:pt-1">
        <SidebarGroupContent>
          <SidebarMenu>
            {group.items.map((item) => (
              <NavLink key={item.id} item={item} active={isItemActive(item)} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <SidebarGroup className="py-1">
        <SidebarGroupLabel
          render={
            <CollapsibleTrigger className="group/label flex w-full items-center justify-between" />
          }
          className="h-7 rounded-sm px-2.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/62 hover:bg-white/10 hover:text-sidebar-foreground"
        >
          <span>{group.label}</span>
          <CaretDown
            size={12}
            className={cn(
              "shrink-0 transition-transform duration-200",
              !isOpen && "-rotate-90",
            )}
          />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  item={item}
                  active={isItemActive(item)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { state } = useSidebar();
  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>(DEFAULT_OPEN_GROUPS);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isAllowed = (item: NavItem) => {
    if (!item.allowedRoles) return true;
    return user ? item.allowedRoles.includes(user.role) : false;
  };

  const isItemActive = (item: NavItem) =>
    pathname === item.href || pathname.startsWith(item.href + "/");

  const visibleTopItems = NAV_ITEMS.filter(isAllowed);
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(isAllowed),
  })).filter((group) => group.items.length > 0);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const initials =
    user?.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";
  const collapsed = state === "collapsed";

  return (
    <ShadcnSidebar
      collapsible="icon"
      className="border-white/10 bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader
        className={cn(
          "h-12 flex-row items-center justify-center border-b border-sidebar-border/50",
          collapsed ? "px-2 justify-center" : "px-3 gap-2.5",
        )}
      >
        {!collapsed && (
          <>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
              <Image
                src="/logo.png"
                alt="HN Enterprises"
                width={36}
                height={36}
                priority
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-semibold text-current tracking-tight">
                HN Enterprises
              </span>
              <span className="truncate text-[10px] text-current opacity-60 font-medium">
                CGD Management
              </span>
            </div>
          </>
        )}
        <SidebarTrigger className="h-8 w-8 shrink-0 text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-foreground" />
      </SidebarHeader>

      <SidebarContent className="px-0 py-1.5">
        <SidebarGroup className="py-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleTopItems.map((item) => (
                <NavLink
                  key={item.id}
                  item={item}
                  active={isItemActive(item)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleGroups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            isOpen={openGroups[group.id] ?? true}
            onToggle={() => toggleGroup(group.id)}
            isItemActive={isItemActive}
          />
        ))}
      </SidebarContent>

      <SidebarSeparator className="bg-sidebar-border/50" />
      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "w-full flex items-center gap-2.5 px-2 py-2 rounded-sm hover:bg-white/10 transition-colors text-left outline-none text-sidebar-foreground",
              collapsed && "justify-center",
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-white/10 text-sidebar-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-current truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-[10px] text-current opacity-60 truncate capitalize">
                    {user?.role.replace(/_/g, " ")}
                  </p>
                </div>
                <CaretUpDown
                  size={14}
                  className="text-current opacity-60 shrink-0"
                />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role.replace(/_/g, " ")}
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
              <Link
                href="/change-password"
                className="flex items-center gap-2 w-full"
              >
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
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
