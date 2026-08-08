import { NavGroup, NavItem } from "@/types/navigation";

export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  customers: "Customers",
  reports: "Reports Center",
  planning: "DPR / Planning",
  plan: "Planning",
  dpr: "DPR",
  inventory: "Inventory & Material",
  billing: "Billing",
  payments: "Payments & Expenses",
  staff: "Staff & Resources",
  plumbers: "Plumbers",
  attendance: "Attendance",
  activity: "Recent Activity",
  users: "Users & Roles",
  masters: "Masters",
  "dynamic-fields": "Dynamic Fields",
  settings: "Settings",
  "audit-logs": "Audit Logs",
  announcements: "Announcements",
  new: "New",
  edit: "Edit",
  profile: "Profile",
};

// Ungrouped, always-visible top-level items.
export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "SquaresFour",
    href: "/dashboard",
  },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "projects", label: "Projects", icon: "Buildings", href: "/projects" },
      { id: "customers", label: "Customers", icon: "Users", href: "/customers" },
      { id: "planning", label: "DPR / Planning", icon: "ClipboardText", href: "/planning" },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    items: [
      { id: "inventory", label: "Inventory & Material", icon: "Package", href: "/inventory" },
      { id: "billing", label: "Billing", icon: "Receipt", href: "/billing", allowedRoles: ["super_admin", "admin", "accounts"] },
      { id: "payments", label: "Payments & Expenses", icon: "CurrencyInr", href: "/payments", allowedRoles: ["super_admin", "admin", "accounts"] },
    ],
  },
  {
    id: "management",
    label: "Management",
    items: [
      { id: "staff", label: "Staff & Resources", icon: "UsersThree", href: "/staff" },
      { id: "plumbers", label: "Plumbers", icon: "Wrench", href: "/plumbers" },
      { id: "attendance", label: "Attendance", icon: "CalendarBlank", href: "/attendance" },
      { id: "activity", label: "Recent Activity", icon: "ClockCounterClockwise", href: "/activity" },
      { id: "users", label: "Users & Roles", icon: "UserGear", href: "/users", allowedRoles: ["super_admin", "admin"] },
      { id: "announcements", label: "Announcements", icon: "Megaphone", href: "/announcements", allowedRoles: ["super_admin", "admin"] },
      { id: "masters", label: "Masters", icon: "Database", href: "/masters", allowedRoles: ["super_admin", "admin"] },
      {
        id: "dynamic-fields",
        label: "Dynamic Fields",
        icon: "SlidersHorizontal",
        href: "/dynamic-fields",
        allowedRoles: ["super_admin", "admin"],
      },
    ],
  },
];
