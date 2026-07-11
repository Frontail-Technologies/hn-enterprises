import { NavGroup, NavItem } from "@/types/navigation";

export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  customers: "Customers",
  surveys: "Surveys",
  planning: "Planning & DPR",
  "work-progress": "Work Progress",
  "gc-uploads": "GC Uploads",
  "pre-commissioning": "Pre-Commissioning",
  "pressure-observation": "Testing / Pressure",
  jmr: "JMR & Field Reports",
  reports: "Reports Center",
  approvals: "Approvals",
  inventory: "Inventory & Material",
  billing: "Billing",
  payments: "Payments & Expenses",
  staff: "Staff & Resources",
  documents: "Documents",
  users: "Users & Roles",
  masters: "Masters",
  settings: "Settings",
  "audit-logs": "Audit Logs",
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
      { id: "surveys", label: "Surveys", icon: "ClipboardText", href: "/surveys" },
      { id: "planning", label: "Planning & DPR", icon: "CalendarBlank", href: "/planning" },
      { id: "work-progress", label: "Work Progress", icon: "ChartBar", href: "/work-progress" },
      { id: "gc-uploads", label: "GC Uploads", icon: "FolderOpen", href: "/gc-uploads" },
      { id: "pre-commissioning", label: "Pre-Commissioning", icon: "Wrench", href: "/pre-commissioning" },
      { id: "pressure-observation", label: "Testing / Pressure", icon: "Gauge", href: "/pressure-observation" },
      { id: "jmr", label: "JMR & Field Reports", icon: "FileText", href: "/jmr" },
      { id: "approvals", label: "Approvals", icon: "CheckSquare", href: "/approvals" },
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
      { id: "documents", label: "Documents", icon: "Folder", href: "/documents" },
      { id: "reports", label: "Reports", icon: "ChartPieSlice", href: "/reports" },
      { id: "users", label: "Users & Roles", icon: "UserGear", href: "/users", allowedRoles: ["super_admin", "admin"] },
      { id: "masters", label: "Masters", icon: "Database", href: "/masters", allowedRoles: ["super_admin", "admin"] },
      { id: "settings", label: "Settings", icon: "Gear", href: "/settings", allowedRoles: ["super_admin"] },
      { id: "audit-logs", label: "Audit Logs", icon: "ClockCounterClockwise", href: "/audit-logs", allowedRoles: ["super_admin"] },
    ],
  },
];
