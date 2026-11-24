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
  MegaphoneIcon as Megaphone,
  WarningIcon as Warning,
  SlidersHorizontalIcon as SlidersHorizontal,
  TrashIcon as Trash,
  SignOutIcon as SignOut,
  LockIcon as Lock,
  CaretUpDownIcon as CaretUpDown,
  CaretDownIcon as CaretDown,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS, NAV_GROUPS } from "@/constants/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/auth.service";
import { NavItem, NavGroup } from "@/types/navigation";
import { cn } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/UserAvatar";

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
  Megaphone,
  Warning,
  SlidersHorizontal,
  Trash,
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
          "relative h-10 gap-3 rounded-lg px-3 text-[14px] font-medium text-sidebar-foreground/75 transition-colors hover:bg-white/6 hover:text-sidebar-foreground",
          active &&
            "bg-white/12 font-semibold text-sidebar-foreground hover:bg-white/12 data-active:bg-white/12 data-active:font-semibold data-active:text-sidebar-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.75 before:rounded-full before:bg-primary group-data-[collapsible=icon]:before:hidden",
        )}
      >
        {IconComponent && (
          <IconComponent
            size={19}
            weight={active ? "fill" : "regular"}
            className={cn(
              "shrink-0",
              active ? "text-primary" : "text-sidebar-foreground/70",
            )}
          />
        )}
        <span className="truncate leading-none">{item.label}</span>
      </SidebarMenuButton>
      {item.badge != null && item.badge > 0 && (
        <SidebarMenuBadge
          className={cn(
            "top-2.5 text-sidebar-foreground/75",
            active && "text-sidebar-foreground",
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
      <SidebarGroup className="py-1.5">
        <SidebarGroupLabel
          render={
            <CollapsibleTrigger className="group/label flex w-full items-center justify-between" />
          }
          className="mb-0.5 h-8 rounded-lg px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50 hover:bg-white/6 hover:text-sidebar-foreground/80"
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
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
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

  const collapsed = state === "collapsed";

  return (
    <ShadcnSidebar
      collapsible="icon"
      className="border-white/10 bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader
        className={cn(
          "app-titlebar h-16 flex-row items-center",
          collapsed ? "justify-center px-2" : "gap-3 px-4",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white",
            collapsed ? "size-8" : "size-9",
          )}
        >
          <Image
            src="/logo.png"
            alt="HN Enterprises"
            width={36}
            height={36}
            priority
            className={collapsed ? "size-7 object-contain" : "size-8 object-contain"}
          />
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[15px] font-semibold tracking-tight text-current">
              HN Enterprises
            </span>
            <span className="truncate text-xs font-medium text-current opacity-60">
              CGD Management
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-2">
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

      <SidebarSeparator className="mx-3 bg-sidebar-border/50" />
      <SidebarFooter className={cn("p-3", collapsed && "items-center px-1.5")}>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sidebar-foreground outline-none transition-colors hover:bg-white/8",
              // Collapsed rail is 3rem wide: an 8×8 avatar with no side padding fits without clipping.
              collapsed && "size-9 justify-center p-0",
            )}
          >
            <UserAvatar name={user?.fullName} src={user?.avatar} tone="inverse" size="sm" className={collapsed ? undefined : "size-9 text-[13px]"} />
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-semibold text-current">
                    {user?.fullName}
                  </p>
                  <p className="truncate text-xs capitalize text-current opacity-60">
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
            <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
              <Lock size={14} /> Change Password
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
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onPasswordChanged={handleLogout}
      />
    </ShadcnSidebar>
  );
}

function ChangePasswordDialog({
  open,
  onOpenChange,
  onPasswordChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordChanged: () => Promise<void>;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
    setMessage(null);
    setError(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    setMessage(null);
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError("New password and confirmation are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword(newPassword);
      setMessage("Password updated successfully. Please login again.");
      window.setTimeout(() => {
        resetForm();
        onOpenChange(false);
        void onPasswordChanged();
      }, 600);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update password.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Set a new password for your admin account. You will need to login again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
          {message ? <p className="text-xs font-medium text-status-success-fg">{message}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="new-password"
      />
    </label>
  );
}
