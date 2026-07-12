"use client";

import { useMemo, useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import {
  DownloadSimpleIcon,
  EyeIcon,
  NotePencilIcon,
  PlusIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";

const staff = [
  { id: "st-1", name: "Amit Rathore", role: "Supervisor", contact: "9823411122", assignedProjects: "Shyam Nagar CGD", status: "Active", lastActive: "2025-02-18 15:20" },
  { id: "st-2", name: "Vikas Saini", role: "Field Executive", contact: "9823001122", assignedProjects: "Green City Phase 1", status: "Active", lastActive: "2025-02-18 11:05" },
  { id: "st-3", name: "Group A", role: "Plumber Team", contact: "9900011223", assignedProjects: "Sunrise Enclave", status: "Inactive", lastActive: "2025-02-10 09:30" },
];

const documents = [
  { id: "doc-1", name: "LOA_SHYAM_2025.pdf", category: "Project Documents", module: "Projects", uploadedBy: "Demo Admin", date: "2025-02-12", status: "Approved" },
  { id: "doc-2", name: "Meter_Photo_BP100245.jpg", category: "Customer Documents", module: "Customers", uploadedBy: "Amit Rathore", date: "2025-02-15", status: "In Review" },
  { id: "doc-3", name: "Pressure_Report_TR553901.pdf", category: "Reports", module: "Testing / Pressure", uploadedBy: "Vikas Saini", date: "2025-02-17", status: "Pending" },
];

const users = [
  { id: "usr-1", name: "Super Admin", contact: "admin@hn.local", role: "Super Admin", area: "All Areas", status: "Active", lastLogin: "2025-02-18 16:00" },
  { id: "usr-2", name: "Amit Rathore", contact: "9823411122", role: "Supervisor", area: "Jaipur", status: "Active", lastLogin: "2025-02-18 11:20" },
  { id: "usr-3", name: "Viewer Ops", contact: "viewer@hn.local", role: "Viewer", area: "Reports", status: "Inactive", lastLogin: "2025-02-10 10:15" },
];

const roles = ["Super Admin", "Admin", "Supervisor", "Field Executive", "Viewer"];

const masterCategories = [
  "Connection Types",
  "Stages",
  "Statuses",
  "Document Categories",
  "Checklist Types",
  "Measurement Units",
];

const masterValues = [
  { id: "m-type-1", category: "Connection Types", value: "Domestic", status: "Active" },
  { id: "m-type-2", category: "Connection Types", value: "Commercial", status: "Active" },
  { id: "m-stage-1", category: "Stages", value: "Survey", status: "Active" },
  { id: "m-stage-2", category: "Stages", value: "GC", status: "Active" },
  { id: "m-status-1", category: "Statuses", value: "Pending", status: "Active" },
  { id: "m-status-2", category: "Statuses", value: "Approved", status: "Active" },
  { id: "m-doc-1", category: "Document Categories", value: "Customer Documents", status: "Active" },
  { id: "m-doc-2", category: "Document Categories", value: "Certificates", status: "Active" },
  { id: "m-check-1", category: "Checklist Types", value: "Safety Verification", status: "Active" },
  { id: "m-check-2", category: "Checklist Types", value: "Installation Verification", status: "Active" },
  { id: "m-unit-1", category: "Measurement Units", value: "Meter", status: "Active" },
  { id: "m-unit-2", category: "Measurement Units", value: "Kilogram", status: "Inactive" },
];

const auditLogs = [
  { id: "log-1", user: "Demo Admin", action: "Approved GC Upload", module: "GC Uploads", description: "GCU-2025-00055 approved.", dateTime: "2025-02-18 16:30", device: "Chrome / Jaipur" },
  { id: "log-2", user: "Amit Rathore", action: "Updated Status", module: "Pre-Commissioning", description: "PC-2025-00128 moved to review.", dateTime: "2025-02-18 11:30", device: "Mobile / Jaipur" },
  { id: "log-3", user: "Super Admin", action: "Created User", module: "Users & Roles", description: "Viewer Ops user created.", dateTime: "2025-02-17 14:10", device: "Edge / Office" },
];

export function StaffResourcesPage() {
  const [filters, setFilters] = useState({ search: "", role: "all", status: "all" });
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return staff.filter((row) =>
      (!search || row.name.toLowerCase().includes(search) || row.contact.includes(search)) &&
      (filters.role === "all" || row.role === filters.role) &&
      (filters.status === "all" || row.status === filters.status)
    );
  }, [filters]);
  const columns: ColumnDef<(typeof staff)[number]>[] = [
    { key: "name", header: "Name", render: (row) => <b>{row.name}</b> },
    { key: "role", header: "Role" },
    { key: "contact", header: "Contact" },
    { key: "assignedProjects", header: "Assigned Projects" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "lastActive", header: "Last Active", render: (row) => formatDateTime(row.lastActive) },
    { key: "actions", header: "Actions", className: "w-20", render: () => <StaffDrawer mode="edit" iconOnly /> },
  ];
  return (
    <PageShell title="Staff & Resources" subtitle="Manage employees, supervisors, field executives, plumbers and teams." actions={<StaffDrawer />}>
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search staff or mobile..."
        title="Staff Filters"
        values={filters}
        filters={[
          { key: "role", placeholder: "All Roles", options: uniqOptions(staff.map((row) => row.role)) },
          { key: "status", placeholder: "All Statuses", options: uniqOptions(staff.map((row) => row.status)) },
        ]}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({ search: "", role: "all", status: "all" })}
      />
      <PaginatedDataTable data={data} columns={columns} />
    </PageShell>
  );
}

export function DocumentsPage() {
  const columns: ColumnDef<(typeof documents)[number]>[] = [
    { key: "name", header: "Document Name", render: (row) => <b>{row.name}</b> },
    { key: "category", header: "Category" },
    { key: "module", header: "Related Module" },
    { key: "uploadedBy", header: "Uploaded By" },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "actions", header: "Actions", className: "w-28", render: () => <IconActions preview download remove /> },
  ];
  return (
    <PageShell title="Documents" subtitle="Central document management for operational files." actions={<DocumentDrawer />}>
      <PaginatedDataTable data={documents} columns={columns} />
    </PageShell>
  );
}

export function ReportsPage() {
  return (
    <div className="space-y-5">
      <Header title="Reports" subtitle="Operational reports and exports." />
      <div className="rounded-xl border border-border/70 bg-card p-8">
        <div className="mx-auto max-w-md text-center">
          <p className="text-base font-bold text-foreground">Reports module coming soon</p>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            Generated reports, saved exports and scheduled operational summaries will be configured here.
          </p>
        </div>
      </div>
    </div>
  );
}

export function UsersRolesPage() {
  const [filters, setFilters] = useState({ search: "", role: "all", status: "all" });
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return users.filter((row) =>
      (!search || row.name.toLowerCase().includes(search) || row.contact.toLowerCase().includes(search)) &&
      (filters.role === "all" || row.role === filters.role) &&
      (filters.status === "all" || row.status === filters.status)
    );
  }, [filters]);
  const columns: ColumnDef<(typeof users)[number]>[] = [
    { key: "name", header: "User Name", render: (row) => <b>{row.name}</b> },
    { key: "contact", header: "Email/Mobile" },
    { key: "role", header: "Role" },
    { key: "area", header: "Assigned Area" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "lastLogin", header: "Last Login", render: (row) => formatDateTime(row.lastLogin) },
    { key: "actions", header: "Actions", className: "w-20", render: () => <UserDrawer mode="edit" iconOnly /> },
  ];
  return (
    <PageShell title="Users & Roles" subtitle="Admin access management and permission control." actions={<UserDrawer />}>
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search users or contact..."
        title="User Filters"
        values={filters}
        filters={[
          { key: "role", placeholder: "All Roles", options: uniqOptions(users.map((row) => row.role)) },
          { key: "status", placeholder: "All Statuses", options: uniqOptions(users.map((row) => row.status)) },
        ]}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({ search: "", role: "all", status: "all" })}
      />
      <PaginatedDataTable data={data} columns={columns} />
    </PageShell>
  );
}

export function MastersPage() {
  const [filters, setFilters] = useState({ search: "", category: "all" });
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return masterValues.filter((row) =>
      (!search || row.value.toLowerCase().includes(search) || row.category.toLowerCase().includes(search)) &&
      (filters.category === "all" || row.category === filters.category)
    );
  }, [filters]);
  const columns: ColumnDef<(typeof masterValues)[number]>[] = [
    { key: "category", header: "Category", render: (row) => <span className="font-medium text-muted-foreground">{row.category}</span> },
    { key: "value", header: "Value", render: (row) => <b>{row.value}</b> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "actions", header: "Actions", className: "w-20", render: () => <MasterDrawer mode="edit" iconOnly /> },
  ];
  return (
    <PageShell title="Masters" subtitle="Manage system configuration values." actions={<MasterDrawer />}>
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search values..."
        title="Master Filters"
        values={filters}
        filters={[
          { key: "category", placeholder: "All Categories", options: uniqOptions(masterCategories) },
        ]}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({ search: "", category: "all" })}
      />
      <PaginatedDataTable data={data} columns={columns} />
    </PageShell>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <Header title="Settings" subtitle="Company profile, workflow defaults and integrations." />
      <section className="grid gap-4 xl:grid-cols-3">
        <SettingsPanel
          title="Company Profile"
          items={["Company Name: HN Enterprises", "Logo: Default mark", "Contact: admin@hn.local"]}
        />
        <SettingsPanel
          title="System Settings"
          items={["Notifications: Enabled", "Workflow defaults: Standard CGD", "Date format: dd MMM yyyy"]}
        />
        <SettingsPanel
          title="Integration Settings"
          items={["Maps: OpenStreetMap", "SMS: Configured", "Storage: Local mock"]}
        />
      </section>
    </div>
  );
}

export function AuditLogsPage() {
  const [filters, setFilters] = useState({ search: "", module: "all" });
  const data = auditLogs.filter((row) =>
    (!filters.search || row.user.toLowerCase().includes(filters.search.toLowerCase())) &&
    (filters.module === "all" || row.module === filters.module)
  );
  const columns: ColumnDef<(typeof auditLogs)[number]>[] = [
    { key: "user", header: "User", render: (row) => <b>{row.user}</b> },
    { key: "action", header: "Action" },
    { key: "module", header: "Module" },
    { key: "description", header: "Description" },
    { key: "dateTime", header: "Date & Time", render: (row) => formatDateTime(row.dateTime) },
    { key: "device", header: "IP/Device" },
  ];
  return (
    <PageShell title="Audit Logs" subtitle="Track important system activity and admin changes.">
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search user..."
        title="Audit Filters"
        values={filters}
        filters={[{ key: "module", placeholder: "All Modules", options: uniqOptions(auditLogs.map((row) => row.module)) }]}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({ search: "", module: "all" })}
      />
      <PaginatedDataTable data={data} columns={columns} />
    </PageShell>
  );
}

function PageShell({ title, subtitle, actions, children }: { title: string; subtitle: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <Header title={title} subtitle={subtitle} actions={actions} />
      <section className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
        {children}
      </section>
    </div>
  );
}

function Header({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{subtitle}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

function PaginatedDataTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 6,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = data.slice(startIndex, startIndex + pageSize);
  const startItem = data.length ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + pagedData.length, data.length);

  return (
    <div className="space-y-3">
      <DataTable
        data={pagedData}
        columns={columns}
        serialNumberStart={startIndex + 1}
      />
      <Pagination
        page={currentPage}
        pageCount={pageCount}
        totalItems={data.length}
        startItem={startItem}
        endItem={endItem}
        onPageChange={setPage}
      />
    </div>
  );
}

function StaffDrawer({ mode = "add", iconOnly = false }: { mode?: "add" | "edit"; iconOnly?: boolean }) {
  return (
    <ManagementDrawer
      title={mode === "edit" ? "Edit Staff" : "Add Staff"}
      description="Create or update employee and team assignments."
      triggerLabel={mode === "edit" ? "Edit" : "Add Staff"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <Field label="Name" />
      <Field label="Mobile" />
      <Field label="Role" select options={["Supervisor", "Field Executive", "Plumber Team", "Admin"]} />
      <Field label="Assigned Projects" />
      <Field label="Status" select options={["Active", "Inactive"]} />
    </ManagementDrawer>
  );
}

function DocumentDrawer() {
  return (
    <ManagementDrawer title="Upload Document" description="Add a file to the central document register." triggerLabel="Upload Document" icon={<UploadSimpleIcon size={15} />}>
      <Field label="Document Name" />
      <Field label="Category" select options={["Customer Documents", "Project Documents", "Reports", "Certificates", "Other"]} />
      <Field label="Related Module" />
      <Field label="File" />
    </ManagementDrawer>
  );
}

function UserDrawer({ mode = "add", iconOnly = false }: { mode?: "add" | "edit"; iconOnly?: boolean }) {
  return (
    <ManagementDrawer
      title={mode === "edit" ? "Edit User" : "Add User"}
      description="Create or update admin access and permissions."
      triggerLabel={mode === "edit" ? "Edit" : "Add User"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <Field label="Name" />
      <Field label="Contact" />
      <Field label="Role" select options={roles} />
      <Field label="Permissions" textarea />
    </ManagementDrawer>
  );
}

function MasterDrawer({ mode = "add", iconOnly = false }: { mode?: "add" | "edit"; iconOnly?: boolean }) {
  return (
    <ManagementDrawer
      title={mode === "edit" ? "Edit Value" : "Add Value"}
      description="Create or update a system configuration value."
      triggerLabel={mode === "edit" ? "Edit" : "Add Value"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <Field label="Category" select options={masterCategories} />
      <Field label="Value" />
      <Field label="Status" select options={["Active", "Inactive"]} />
    </ManagementDrawer>
  );
}

function ManagementDrawer({
  title,
  description,
  triggerLabel,
  icon,
  iconOnly = false,
  children,
}: {
  title: string;
  description: string;
  triggerLabel: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  children: ReactNode;
}) {
  return (
    <Sheet>
      {iconOnly ? (
        <ActionTooltip label={triggerLabel}>
          <SheetTrigger
            render={
              <button
                type="button"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label={triggerLabel}
              />
            }
          >
            {icon ?? <PlusIcon size={15} />}
          </SheetTrigger>
        </ActionTooltip>
      ) : (
        <SheetTrigger render={<Button type="button" />}>
          {icon ?? <PlusIcon size={15} />}
          {triggerLabel}
        </SheetTrigger>
      )}
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4">{children}</div>
        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button">Save</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, select, textarea, options = [] }: { label: string; select?: boolean; textarea?: boolean; options?: string[] }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-foreground">{label}</span>
      {select ? (
        <Select defaultValue={options[0]}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
        </Select>
      ) : textarea ? (
        <Textarea className="min-h-24" />
      ) : (
        <Input />
      )}
    </label>
  );
}

function SettingsPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-4">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-lg bg-muted/30 px-3 py-2 text-sm font-medium text-foreground">{item}</div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-3">Edit</Button>
    </section>
  );
}

function IconActions({ preview, download, remove, edit }: { preview?: boolean; download?: boolean; remove?: boolean; edit?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {preview ? <ActionIcon label="Preview" icon={<EyeIcon size={15} />} /> : null}
      {download ? <ActionIcon label="Download" icon={<DownloadSimpleIcon size={15} />} /> : null}
      {edit ? <ActionIcon label="Edit" icon={<NotePencilIcon size={15} />} /> : null}
      {remove ? <ActionIcon label="Delete" icon={<TrashIcon size={15} />} /> : null}
    </div>
  );
}

function ActionIcon({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <ActionTooltip label={label}>
      <button type="button" className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label={label}>
        {icon}
      </button>
    </ActionTooltip>
  );
}

function uniqOptions(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ label: value, value }));
}

function formatDate(value: string) {
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

function formatDateTime(value: string) {
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
