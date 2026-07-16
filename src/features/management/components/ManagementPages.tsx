"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  CaretLeftIcon,
  CaretRightIcon,
  ClockIcon,
  DownloadSimpleIcon,
  EyeIcon,
  MapPinIcon,
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
import { DatePicker } from "@/components/shared/DatePicker";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import {
  configurableMasterSheetColumns,
  masterSheetColumnValueTypes,
  masterTabs,
  masterValues,
  type MasterSheetColumnValueType,
  type MasterTabId,
  type MasterValueCategory,
} from "../masters.config";

const staff = [
  {
    id: "st-1",
    name: "Amit Rathore",
    role: "Supervisor",
    contact: "9823411122",
    assignedProjects: "Shyam Nagar CGD",
    status: "Active",
    lastActive: "2025-02-18 15:20",
    joiningDate: "2024-11-01",
    salaryType: "Monthly",
    monthlySalary: "42000",
    allowance: "3500",
    paymentAccountType: "Bank Account",
    bankType: "Savings",
    bankName: "HDFC Bank",
    accountHolderName: "Amit Rathore",
    accountNumber: "****1122",
    ifscCode: "HDFC0001122",
    upiType: "Personal UPI",
    upiId: "amit.rathore@upi",
    salaryEffectiveFrom: "2025-01-01",
    lastSalaryRevisionDate: "2025-01-01",
    nextSalaryReviewDate: "2025-07-01",
  },
  {
    id: "st-2",
    name: "Vikas Saini",
    role: "Field Executive",
    contact: "9823001122",
    assignedProjects: "Green City Phase 1",
    status: "Active",
    lastActive: "2025-02-18 11:05",
    joiningDate: "2025-01-12",
    salaryType: "Monthly",
    monthlySalary: "28000",
    allowance: "1800",
    paymentAccountType: "Bank Account",
    bankType: "Salary Account",
    bankName: "SBI",
    accountHolderName: "Vikas Saini",
    accountNumber: "****4401",
    ifscCode: "SBIN0004401",
    upiType: "Personal UPI",
    upiId: "vikas.saini@upi",
    salaryEffectiveFrom: "2025-01-12",
    lastSalaryRevisionDate: "2025-01-12",
    nextSalaryReviewDate: "2025-07-12",
  },
  {
    id: "st-3",
    name: "Group A",
    role: "Plumber Team",
    contact: "9900011223",
    assignedProjects: "Sunrise Enclave",
    status: "Inactive",
    lastActive: "2025-02-10 09:30",
    joiningDate: "2024-09-20",
    salaryType: "Work Basis",
    monthlySalary: "0",
    allowance: "0",
    paymentAccountType: "UPI",
    bankType: "Current",
    bankName: "",
    accountHolderName: "Group A",
    accountNumber: "",
    ifscCode: "",
    upiType: "Team UPI",
    upiId: "groupa@upi",
    salaryEffectiveFrom: "2024-09-20",
    lastSalaryRevisionDate: "2024-12-01",
    nextSalaryReviewDate: "2025-06-01",
  },
];

type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Late"
  | "Half Day"
  | "Leave"
  | "Not Marked";

type AttendanceRecord = {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  workHours?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  locationCapturedAt?: string;
  remarks?: string;
};

const supervisorOptions = [
  { id: "st-1", name: "Amit Rathore" },
  { id: "st-4", name: "Priya Nair" },
  { id: "st-5", name: "Ramesh Kumar" },
];

function buildAttendanceRecords(month: Date): AttendanceRecord[] {
  const monthKey = format(month, "yyyy-MM");

  return [
    attendanceRecord(
      "att-1",
      "st-1",
      "Amit Rathore",
      `${monthKey}-01`,
      "Present",
      "09:12 AM",
      "06:05 PM",
      "8h 53m",
      26.8951,
      75.7684,
      "Shyam Nagar Block B, Jaipur",
      "09:12 AM",
      "Field visit started on time.",
    ),
    attendanceRecord(
      "att-2",
      "st-1",
      "Amit Rathore",
      `${monthKey}-02`,
      "Late",
      "10:05 AM",
      "06:10 PM",
      "8h 05m",
      26.8877,
      75.7592,
      "Green City Phase 1, Jaipur",
      "10:05 AM",
      "Delayed due to client meeting.",
    ),
    attendanceRecord(
      "att-3",
      "st-1",
      "Amit Rathore",
      `${monthKey}-03`,
      "Absent",
      undefined,
      undefined,
      undefined,
      26.9124,
      75.7873,
      "Office marked location, Jaipur",
      "11:00 AM",
      "Approved absence.",
    ),
    attendanceRecord(
      "att-4",
      "st-4",
      "Priya Nair",
      `${monthKey}-04`,
      "Present",
      "09:00 AM",
      "05:45 PM",
      "8h 45m",
      26.9021,
      75.7819,
      "Sunrise Enclave, Jaipur",
      "09:00 AM",
      "Routine supervision.",
    ),
    attendanceRecord(
      "att-5",
      "st-5",
      "Ramesh Kumar",
      `${monthKey}-05`,
      "Half Day",
      "09:30 AM",
      "01:30 PM",
      "4h",
      26.8789,
      75.7421,
      "Commercial Block, Jaipur",
      "09:30 AM",
      "Half-day site handover.",
    ),
    attendanceRecord(
      "att-6",
      "st-4",
      "Priya Nair",
      `${monthKey}-08`,
      "Leave",
      undefined,
      undefined,
      undefined,
      26.8854,
      75.7651,
      "Leave request location, Jaipur",
      "09:15 AM",
      "Personal leave.",
    ),
    attendanceRecord(
      "att-7",
      "st-5",
      "Ramesh Kumar",
      `${monthKey}-12`,
      "Present",
      "09:20 AM",
      "06:00 PM",
      "8h 40m",
      26.8958,
      75.7792,
      "Main Store, Jaipur",
      "09:20 AM",
      "Material reconciliation.",
    ),
  ];
}

function attendanceRecord(
  id: string,
  staffId: string,
  staffName: string,
  date: string,
  status: AttendanceStatus,
  checkInTime?: string,
  checkOutTime?: string,
  workHours?: string,
  latitude?: number,
  longitude?: number,
  locationAddress?: string,
  locationCapturedAt?: string,
  remarks?: string,
): AttendanceRecord {
  return {
    id,
    staffId,
    staffName,
    role: "Supervisor",
    date,
    status,
    checkInTime,
    checkOutTime,
    workHours,
    latitude,
    longitude,
    locationAddress,
    locationCapturedAt,
    remarks,
  };
}

const documents = [
  {
    id: "doc-1",
    name: "LOA_SHYAM_2025.pdf",
    category: "Project Documents",
    module: "Projects",
    uploadedBy: "Demo Admin",
    date: "2025-02-12",
    status: "Approved",
  },
  {
    id: "doc-2",
    name: "Meter_Photo_BP100245.jpg",
    category: "Customer Documents",
    module: "Customers",
    uploadedBy: "Amit Rathore",
    date: "2025-02-15",
    status: "In Review",
  },
  {
    id: "doc-3",
    name: "Pressure_Report_TR553901.pdf",
    category: "Reports",
    module: "Testing / Pressure",
    uploadedBy: "Vikas Saini",
    date: "2025-02-17",
    status: "Pending",
  },
];

const users = [
  {
    id: "usr-1",
    name: "Super Admin",
    username: "super.admin",
    contact: "admin@hn.local",
    role: "Super Admin",
    status: "Active",
    lastLogin: "2025-02-18 16:00",
  },
  {
    id: "usr-2",
    name: "Amit Rathore",
    username: "amit.rathore",
    contact: "9823411122",
    role: "Supervisor",
    status: "Active",
    lastLogin: "2025-02-18 11:20",
  },
  {
    id: "usr-3",
    name: "Viewer Ops",
    username: "viewer.ops",
    contact: "viewer@hn.local",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "2025-02-10 10:15",
  },
];

const roles = [
  "Super Admin",
  "Admin",
  "Supervisor",
  "Field Executive",
  "Viewer",
];

const auditLogs = [
  {
    id: "log-1",
    user: "Demo Admin",
    action: "Approved GC Upload",
    module: "GC Uploads",
    description: "GCU-2025-00055 approved.",
    dateTime: "2025-02-18 16:30",
    device: "Chrome / Jaipur",
  },
  {
    id: "log-2",
    user: "Amit Rathore",
    action: "Updated Status",
    module: "Pre-Commissioning",
    description: "PC-2025-00128 moved to review.",
    dateTime: "2025-02-18 11:30",
    device: "Mobile / Jaipur",
  },
  {
    id: "log-3",
    user: "Super Admin",
    action: "Created User",
    module: "Users & Roles",
    description: "Viewer Ops user created.",
    dateTime: "2025-02-17 14:10",
    device: "Edge / Office",
  },
];

export function StaffResourcesPage() {
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return staff.filter(
      (row) =>
        (!search ||
          row.name.toLowerCase().includes(search) ||
          row.contact.includes(search)) &&
        (filters.role === "all" || row.role === filters.role) &&
        (filters.status === "all" || row.status === filters.status),
    );
  }, [filters]);
  const columns: ColumnDef<(typeof staff)[number]>[] = [
    { key: "name", header: "Name", render: (row) => <b>{row.name}</b> },
    { key: "role", header: "Role" },
    { key: "contact", header: "Contact" },
    { key: "assignedProjects", header: "Assigned Projects" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "lastActive",
      header: "Last Active",
      render: (row) => formatDateTime(row.lastActive),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: (row) => (
        <ActionTooltip label="Edit staff">
          <Link
            href={`/staff/${row.id}/edit`}
            aria-label={`Edit ${row.name}`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <NotePencilIcon size={15} />
          </Link>
        </ActionTooltip>
      ),
    },
  ];
  return (
    <PageShell
      title="Staff & Resources"
      subtitle="Manage employees, supervisors, field executives, plumbers and teams."
      actions={<StaffDrawer />}
    >
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search staff or mobile..."
        title="Staff Filters"
        values={filters}
        filters={[
          {
            key: "role",
            placeholder: "All Roles",
            options: uniqOptions(staff.map((row) => row.role)),
          },
          {
            key: "status",
            placeholder: "All Statuses",
            options: uniqOptions(staff.map((row) => row.status)),
          },
        ]}
        onChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
        onReset={() => setFilters({ search: "", role: "all", status: "all" })}
      />
      <PaginatedDataTable data={data} columns={columns} />
    </PageShell>
  );
}

export function AttendancePage() {
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedSupervisor, setSelectedSupervisor] = useState(
    supervisorOptions[0]?.id ?? "",
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const attendanceRecords = useMemo(
    () => buildAttendanceRecords(calendarMonth),
    [calendarMonth],
  );
  const visibleRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (record) => record.staffId === selectedSupervisor,
      ),
    [attendanceRecords, selectedSupervisor],
  );
  const selectedSupervisorName =
    supervisorOptions.find((supervisor) => supervisor.id === selectedSupervisor)
      ?.name ?? "Supervisor";
  const monthDays = useMemo(() => {
    const days = eachDayOfInterval({
      start: startOfMonth(calendarMonth),
      end: endOfMonth(calendarMonth),
    });

    return [
      ...Array.from(
        { length: getDay(startOfMonth(calendarMonth)) },
        () => null,
      ),
      ...days,
    ];
  }, [calendarMonth]);

  const selectedRecord = selectedDate
    ? visibleRecords.find((record) =>
        isSameDay(parseISO(record.date), selectedDate),
      )
    : undefined;
  const attendanceControls = (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={selectedSupervisor}
        onValueChange={(value) => {
          if (!value) return;
          setSelectedSupervisor(value);
          setSelectedDate(null);
          setDrawerOpen(false);
        }}
      >
        <SelectTrigger className="h-8 w-[190px] bg-card">
          <SelectValue>{selectedSupervisorName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {supervisorOptions.map((supervisor) => (
            <SelectItem key={supervisor.id} value={supervisor.id}>
              {supervisor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center rounded-md border border-border bg-card">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCalendarMonth((current) => subMonths(current, 1))}
        >
          <CaretLeftIcon size={15} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCalendarMonth(startOfMonth(new Date()))}
        >
          {format(calendarMonth, "MMM yyyy")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCalendarMonth((current) => addMonths(current, 1))}
        >
          <CaretRightIcon size={15} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">{attendanceControls}</div>

      <section className="space-y-3 rounded-lg border border-border/70 bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AttendanceLegend />
          <p className="text-xs font-medium text-muted-foreground">
            Showing attendance for{" "}
            <span className="text-foreground">{selectedSupervisorName}</span>
          </p>
        </div>
        <div className="grid grid-cols-7 overflow-hidden rounded-md border border-border/70 bg-secondary text-xs font-semibold text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="border-r border-border/70 px-2.5 py-2 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-border/70 bg-card">
          {monthDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`blank-${index}`}
                  className="min-h-28 border-b border-r border-border/70 bg-muted/20"
                />
              );
            }
            const dayRecord = visibleRecords.find((record) =>
              isSameDay(parseISO(record.date), day),
            );
            const status = dayRecord?.status ?? "Not Marked";

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  setSelectedDate(day);
                  setDrawerOpen(true);
                }}
                className={cn(
                  "min-h-28 border-b border-r border-border/70 p-2.5 text-left transition-colors hover:bg-accent/45",
                  attendanceCellClass(status),
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {format(day, "d")}
                  </span>
                  <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                    {status}
                  </span>
                </div>
                {dayRecord ? (
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {dayRecord.checkInTime ? (
                      <p className="flex items-center gap-1">
                        <ClockIcon size={13} />
                        {dayRecord.checkInTime}
                        {dayRecord.checkOutTime
                          ? ` - ${dayRecord.checkOutTime}`
                          : ""}
                      </p>
                    ) : null}
                    {dayRecord.latitude && dayRecord.longitude ? (
                      <p className="flex items-center gap-1 text-foreground">
                        <MapPinIcon size={13} className="text-primary" />
                        Location captured
                      </p>
                    ) : null}
                    <p className="line-clamp-2">{dayRecord.staffName}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Click to mark
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <AttendanceDrawer
        key={`${selectedDate ? format(selectedDate, "yyyy-MM-dd") : "none"}-${selectedSupervisor}`}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        date={selectedDate}
        record={selectedRecord}
        selectedSupervisor={selectedSupervisor}
      />
    </div>
  );
}

export function StaffEditPage({ id }: { id: string }) {
  const staffMember = staff.find((row) => row.id === id);
  const [paymentAccountType, setPaymentAccountType] = useState(
    staffMember?.paymentAccountType ?? "Bank Account",
  );

  if (!staffMember) {
    return (
      <PageShell
        title="Edit Staff"
        subtitle="Update employee and salary details."
      >
        <div className="rounded-lg border border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
          Staff record not found.
        </div>
      </PageShell>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <Header
        title="Edit Staff"
        subtitle="Update employee, assignment and salary details."
      />

      <section className="rounded-lg border border-border/70 bg-card">
        <div className="border-b border-border/70 px-4 py-3">
          <p className="text-base font-semibold text-foreground">
            {staffMember.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {staffMember.role} : {staffMember.assignedProjects}
          </p>
        </div>

        <div className="grid gap-6 p-4 lg:grid-cols-2">
          <FormSection title="Basic Details">
            <EditField label="Name" defaultValue={staffMember.name} />
            <EditField label="Mobile" defaultValue={staffMember.contact} />
            <EditField
              label="Role"
              select
              defaultValue={staffMember.role}
              options={[
                "Supervisor",
                "Field Executive",
                "Plumber Team",
                "Admin",
              ]}
            />
            <EditField
              label="Status"
              select
              defaultValue={staffMember.status}
              options={["Active", "Inactive"]}
            />
          </FormSection>

          <FormSection title="Assignment">
            <EditField
              label="Assigned Projects"
              defaultValue={staffMember.assignedProjects}
            />
            <EditDateField
              label="Joining Date"
              defaultValue={staffMember.joiningDate}
            />
          </FormSection>

          <FormSection title="Salary Details">
            <EditField
              label="Salary Type"
              select
              defaultValue={staffMember.salaryType}
              options={["Monthly", "Daily Wage", "Work Basis", "Contract"]}
            />
            <EditField
              label="Monthly Salary"
              defaultValue={staffMember.monthlySalary}
            />
          </FormSection>

          <FormSection title="Bank / UPI Details">
            <EditField
              label="Payment Type"
              select
              defaultValue={paymentAccountType}
              options={["Bank Account", "UPI", "Cash", "Other"]}
              onValueChange={setPaymentAccountType}
            />
            {paymentAccountType === "Bank Account" ? (
              <>
                <EditField
                  label="Bank Type"
                  select
                  defaultValue={staffMember.bankType}
                  options={[
                    "Savings",
                    "Current",
                    "Salary Account",
                    "Jan Dhan",
                    "Other",
                  ]}
                />
                <EditField
                  label="Bank Name"
                  defaultValue={staffMember.bankName}
                />
                <EditField
                  label="Account Number"
                  defaultValue={staffMember.accountNumber}
                />
                <EditField
                  label="IFSC Code"
                  defaultValue={staffMember.ifscCode}
                />
              </>
            ) : null}
            {paymentAccountType === "UPI" ? (
              <>
                <EditField
                  label="UPI Type"
                  select
                  defaultValue={staffMember.upiType}
                  options={[
                    "Personal UPI",
                    "Team UPI",
                    "Business UPI",
                    "PhonePe",
                    "Google Pay",
                    "Paytm",
                    "Other",
                  ]}
                />
                <EditField label="UPI ID" defaultValue={staffMember.upiId} />
              </>
            ) : null}
            {paymentAccountType === "Cash" ? (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Cash payment selected. No bank or UPI details required.
              </p>
            ) : null}
          </FormSection>

          <FormSection title="Notes">
            <EditField
              label="Remarks"
              textarea
              defaultValue="Salary and assignment details can be updated after approval."
            />
          </FormSection>
        </div>
      </section>

      <div className="fixed bottom-0 right-0 z-20 flex w-full items-center justify-end gap-2 border-t border-border bg-card/95 px-6 py-3 shadow-sm backdrop-blur md:left-60 md:w-auto">
        <Link href="/staff" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
        <Button type="button">Save Changes</Button>
      </div>
    </div>
  );
}

export function DocumentsPage() {
  const columns: ColumnDef<(typeof documents)[number]>[] = [
    {
      key: "name",
      header: "Document Name",
      render: (row) => <b>{row.name}</b>,
    },
    { key: "category", header: "Category" },
    { key: "module", header: "Related Module" },
    { key: "uploadedBy", header: "Uploaded By" },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: () => <IconActions preview download remove />,
    },
  ];
  return (
    <PageShell
      title="Documents"
      subtitle="Central document management for operational files."
      actions={<DocumentDrawer />}
    >
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
          <p className="text-base font-semibold text-foreground">
            Reports module coming soon
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            Generated reports, saved exports and scheduled operational summaries
            will be configured here.
          </p>
        </div>
      </div>
    </div>
  );
}

export function UsersRolesPage() {
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return users.filter(
      (row) =>
        (!search ||
          row.name.toLowerCase().includes(search) ||
          row.username.toLowerCase().includes(search) ||
          row.contact.toLowerCase().includes(search)) &&
        (filters.role === "all" || row.role === filters.role) &&
        (filters.status === "all" || row.status === filters.status),
    );
  }, [filters]);
  const columns: ColumnDef<(typeof users)[number]>[] = [
    { key: "name", header: "User Name", render: (row) => <b>{row.name}</b> },
    {
      key: "username",
      header: "Username",
      render: (row) => (
        <span className="font-medium text-foreground">{row.username}</span>
      ),
    },
    { key: "role", header: "Role" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "lastLogin",
      header: "Last Login",
      render: (row) => formatDateTime(row.lastLogin),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: () => <UserDrawer mode="edit" iconOnly />,
    },
  ];
  return (
    <PageShell
      title="Users & Roles"
      subtitle="Admin access management and permission control."
      actions={<UserDrawer />}
    >
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search user or username..."
        title="User Filters"
        values={filters}
        filters={[
          {
            key: "role",
            placeholder: "All Roles",
            options: uniqOptions(users.map((row) => row.role)),
          },
          {
            key: "status",
            placeholder: "All Statuses",
            options: uniqOptions(users.map((row) => row.status)),
          },
        ]}
        onChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
        onReset={() => setFilters({ search: "", role: "all", status: "all" })}
      />
      <PaginatedDataTable data={data} columns={columns} />
    </PageShell>
  );
}

export function MastersPage() {
  const [activeTab, setActiveTab] = useState<MasterTabId>("Payment Types");
  const [search, setSearch] = useState("");
  const isColumnTab = activeTab === "Master Sheet Columns";

  const valueData = useMemo(() => {
    const query = search.toLowerCase();
    return masterValues.filter(
      (row) =>
        row.category === activeTab &&
        (!query ||
          row.value.toLowerCase().includes(query) ||
          row.description.toLowerCase().includes(query)),
    );
  }, [activeTab, search]);
  const columns: ColumnDef<(typeof masterValues)[number]>[] = [
    {
      key: "value",
      header: "Value",
      render: (row) => (
        <span className="font-semibold text-foreground">{row.value}</span>
      ),
    },
    { key: "description", header: "Description" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: () => (
        <MasterValueDrawer
          category={activeTab as MasterValueCategory}
          mode="edit"
          iconOnly
        />
      ),
    },
  ];
  const columnData = useMemo(() => {
    const query = search.toLowerCase();
    return configurableMasterSheetColumns.filter(
      (row) =>
        !query ||
        row.label.toLowerCase().includes(query) ||
        row.key.toLowerCase().includes(query) ||
        row.group.toLowerCase().includes(query),
    );
  }, [search]);
  const masterSheetColumnColumns: ColumnDef<
    (typeof configurableMasterSheetColumns)[number]
  >[] = [
    {
      key: "label",
      header: "Column Label",
      render: (row) => (
        <span className="font-semibold text-foreground">{row.label}</span>
      ),
    },
    { key: "group", header: "Group" },
    { key: "valueType", header: "Value Type" },
    {
      key: "dropdownOptions",
      header: "Options",
      render: (row) =>
        row.valueType === "Dropdown" ? row.dropdownOptions?.join(", ") : "-",
    },
    {
      key: "required",
      header: "Required",
      render: (row) => (row.required ? "Yes" : "No"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: () => <MasterSheetColumnDrawer mode="edit" iconOnly />,
    },
  ];
  return (
    <PageShell
      title="Masters"
      subtitle="Manage system configuration values."
      hideTitle
      tabs={
        <MasterTabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setSearch("");
          }}
        />
      }
      actions={
        isColumnTab ? (
          <MasterSheetColumnDrawer />
        ) : (
          <MasterValueDrawer category={activeTab as MasterValueCategory} />
        )
      }
    >
      <div className="max-w-sm">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            isColumnTab
              ? "Search columns..."
              : `Search ${activeTab.toLowerCase()}...`
          }
        />
      </div>
      {isColumnTab ? (
        <PaginatedDataTable
          data={columnData}
          columns={masterSheetColumnColumns}
        />
      ) : (
        <PaginatedDataTable data={valueData} columns={columns} />
      )}
    </PageShell>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <Header
        title="Settings"
        subtitle="Company profile, workflow defaults and integrations."
      />
      <section className="grid gap-4 xl:grid-cols-3">
        <SettingsPanel
          title="Company Profile"
          items={[
            "Company Name: HN Enterprises",
            "Logo: Default mark",
            "Contact: admin@hn.local",
          ]}
        />
        <SettingsPanel
          title="System Settings"
          items={[
            "Notifications: Enabled",
            "Workflow defaults: Standard CGD",
            "Date format: dd MMM yyyy",
          ]}
        />
        <SettingsPanel
          title="Integration Settings"
          items={[
            "Maps: OpenStreetMap",
            "SMS: Configured",
            "Storage: Local mock",
          ]}
        />
      </section>
    </div>
  );
}

export function AuditLogsPage() {
  const [filters, setFilters] = useState({ search: "", module: "all" });
  const data = auditLogs.filter(
    (row) =>
      (!filters.search ||
        row.user.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.module === "all" || row.module === filters.module),
  );
  const columns: ColumnDef<(typeof auditLogs)[number]>[] = [
    { key: "user", header: "User", render: (row) => <b>{row.user}</b> },
    { key: "action", header: "Action" },
    { key: "module", header: "Module" },
    { key: "description", header: "Description" },
    {
      key: "dateTime",
      header: "Date & Time",
      render: (row) => formatDateTime(row.dateTime),
    },
    { key: "device", header: "IP/Device" },
  ];
  return (
    <PageShell
      title="Audit Logs"
      subtitle="Track important system activity and admin changes."
    >
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search user..."
        title="Audit Filters"
        values={filters}
        filters={[
          {
            key: "module",
            placeholder: "All Modules",
            options: uniqOptions(auditLogs.map((row) => row.module)),
          },
        ]}
        onChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
        onReset={() => setFilters({ search: "", module: "all" })}
      />
      <PaginatedDataTable data={data} columns={columns} />
    </PageShell>
  );
}

function AttendanceLegend() {
  const statuses: AttendanceStatus[] = [
    "Present",
    "Absent",
    "Late",
    "Half Day",
    "Leave",
    "Not Marked",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <span
          key={status}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium",
            attendanceCellClass(status),
          )}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {status}
        </span>
      ))}
    </div>
  );
}

function AttendanceDrawer({
  open,
  onOpenChange,
  date,
  record,
  selectedSupervisor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  record?: AttendanceRecord;
  selectedSupervisor: string;
}) {
  const defaultSupervisor =
    supervisorOptions.find(
      (supervisor) => supervisor.id === selectedSupervisor,
    ) ?? supervisorOptions[0];
  const [status, setStatus] = useState<AttendanceStatus>(
    record?.status ?? "Present",
  );
  const [checkInTime, setCheckInTime] = useState(
    toTimeInputValue(record?.checkInTime),
  );
  const [checkOutTime, setCheckOutTime] = useState(
    toTimeInputValue(record?.checkOutTime),
  );
  const location =
    typeof record?.latitude === "number" &&
    typeof record?.longitude === "number"
      ? { latitude: record.latitude, longitude: record.longitude }
      : null;

  const hasLocation = Boolean(location);
  const staffName =
    record?.staffName ?? defaultSupervisor?.name ?? "Supervisor";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>
            {date ? format(date, "dd MMM yyyy") : "Attendance"}
          </SheetTitle>
          <SheetDescription>
            {staffName} : Supervisor attendance
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Status
              </span>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value) setStatus(value as AttendanceStatus);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "Present",
                      "Absent",
                      "Late",
                      "Half Day",
                      "Leave",
                    ] as AttendanceStatus[]
                  ).map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Working Hours
              </span>
              <Input value={record?.workHours ?? "-"} readOnly />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Check-in Time
              </span>
              <Input
                type="time"
                value={checkInTime}
                onChange={(event) => setCheckInTime(event.target.value)}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Check-out Time
              </span>
              <Input
                type="time"
                value={checkOutTime}
                onChange={(event) => setCheckOutTime(event.target.value)}
              />
            </label>
          </div>

          <section className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Mobile Location Evidence
                </p>
                <p className="text-xs text-muted-foreground">
                  Location is captured from the mobile app and is read-only
                  here.
                </p>
              </div>
            </div>
            {!hasLocation ? (
              <p className="rounded-md border border-border bg-background/70 px-2.5 py-2 text-xs font-medium text-muted-foreground">
                No mobile location captured for this attendance record.
              </p>
            ) : (
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <InfoLine
                  label="Latitude"
                  value={location?.latitude.toFixed(6) ?? "-"}
                />
                <InfoLine
                  label="Longitude"
                  value={location?.longitude.toFixed(6) ?? "-"}
                />
                <InfoLine
                  label="Captured At"
                  value={record?.locationCapturedAt || "-"}
                />
                <InfoLine
                  label="Address"
                  value={record?.locationAddress || "-"}
                />
              </div>
            )}
          </section>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Remarks
            </span>
            <Textarea defaultValue={record?.remarks} className="min-h-24" />
          </label>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="button">Save Changes</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/70 px-2.5 py-2">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function toTimeInputValue(value?: string) {
  if (!value || value === "-") return "";
  const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return value;

  const [, hourValue, minuteValue, meridiem] = match;
  let hour = Number(hourValue);
  if (meridiem.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minuteValue}`;
}

function attendanceCellClass(status: AttendanceStatus) {
  switch (status) {
    case "Present":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Absent":
      return "border-red-200 bg-red-50 text-red-700";
    case "Late":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "Half Day":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Leave":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-border bg-card text-muted-foreground";
  }
}

function PageShell({
  title,
  subtitle,
  actions,
  tabs,
  hideTitle = false,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  tabs?: ReactNode;
  hideTitle?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {hideTitle ? (
        actions ? (
          <div className="flex justify-end">{actions}</div>
        ) : null
      ) : (
        <Header title={title} subtitle={subtitle} actions={actions} />
      )}
      {tabs ? <div className="border-b border-border/70">{tabs}</div> : null}
      <section className="space-y-3 rounded-lg border border-border/70 bg-card p-3">
        {children}
      </section>
    </div>
  );
}

function MasterTabs({
  activeTab,
  onChange,
}: {
  activeTab: MasterTabId;
  onChange: (tab: MasterTabId) => void;
}) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto border-b border-border/70">
      {masterTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            "h-10 w-fit shrink-0 border-b-2 border-transparent px-0.5 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "border-primary text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Header({
  title,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
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
      <Pagination
        compact
        page={currentPage}
        pageCount={pageCount}
        totalItems={data.length}
        startItem={startItem}
        endItem={endItem}
        onPageChange={setPage}
      />
      <DataTable
        data={pagedData}
        columns={columns}
        serialNumberStart={startIndex + 1}
        stickyHeader
        stickyLastColumn
      />
    </div>
  );
}

function StaffDrawer({
  mode = "add",
  iconOnly = false,
}: {
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
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
      <Field
        label="Role"
        select
        options={["Supervisor", "Field Executive", "Plumber Team", "Admin"]}
      />
      <Field label="Assigned Projects" />
      <Field label="Status" select options={["Active", "Inactive"]} />
    </ManagementDrawer>
  );
}

function DocumentDrawer() {
  return (
    <ManagementDrawer
      title="Upload Document"
      description="Add a file to the central document register."
      triggerLabel="Upload Document"
      icon={<UploadSimpleIcon size={15} />}
    >
      <Field label="Document Name" />
      <Field
        label="Category"
        select
        options={[
          "Customer Documents",
          "Project Documents",
          "Reports",
          "Certificates",
          "Other",
        ]}
      />
      <Field label="Related Module" />
      <Field label="File" />
    </ManagementDrawer>
  );
}

function UserDrawer({
  mode = "add",
  iconOnly = false,
}: {
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  return (
    <ManagementDrawer
      title={mode === "edit" ? "Edit User" : "Add User"}
      description={
        mode === "edit"
          ? "Update access, permissions or reset password."
          : "Create access with username and initial password."
      }
      triggerLabel={mode === "edit" ? "Edit" : "Add User"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <Field label="Name" />
      <Field label="Contact" />
      <Field label="Username" />
      <Field label="Role" select options={roles} />
      <div className="rounded-lg border border-border/70 bg-secondary/35 p-3">
        <p className="text-sm font-semibold text-foreground">
          {mode === "edit" ? "Reset Password" : "Initial Password"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {mode === "edit"
            ? "Leave password fields blank if you do not want to change it."
            : "User can change this password after first login."}
        </p>
        <div className="mt-3 space-y-3">
          <Field
            label={mode === "edit" ? "New Password" : "Password"}
            password
          />
          <Field label="Confirm Password" password />
        </div>
      </div>
      <Field label="Permissions" textarea />
    </ManagementDrawer>
  );
}

function MasterValueDrawer({
  category,
  mode = "add",
  iconOnly = false,
}: {
  category: MasterValueCategory;
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  return (
    <ManagementDrawer
      title={mode === "edit" ? `Edit ${category}` : `Add ${category}`}
      description={`Create or update ${category.toLowerCase()} options.`}
      triggerLabel={mode === "edit" ? "Edit" : "Add Value"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <Field label="Value" />
      <Field label="Description" textarea />
      <Field label="Status" select options={["Active", "Inactive"]} />
    </ManagementDrawer>
  );
}

function MasterSheetColumnDrawer({
  mode = "add",
  iconOnly = false,
}: {
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  const [valueType, setValueType] =
    useState<MasterSheetColumnValueType>("Text");
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([
    "Cash",
    "UPI",
  ]);

  return (
    <ManagementDrawer
      title={mode === "edit" ? "Edit Column" : "Add Column"}
      description="Configure an extra customer master-sheet column."
      triggerLabel={mode === "edit" ? "Edit" : "Add Column"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <Field label="Column Label" />
      <Field label="Group" />
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-foreground">Value Type</span>
        <Select
          value={valueType}
          onValueChange={(value) => {
            if (value) setValueType(value as MasterSheetColumnValueType);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {masterSheetColumnValueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      {valueType === "Dropdown" ? (
        <DropdownOptionBuilder
          options={dropdownOptions}
          onChange={setDropdownOptions}
        />
      ) : null}
      <Field label="Required" select options={["No", "Yes"]} />
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
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                })}
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
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="button">Save</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  select,
  textarea,
  password,
  options = [],
}: {
  label: string;
  select?: boolean;
  textarea?: boolean;
  password?: boolean;
  options?: string[];
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {select ? (
        <Select defaultValue={options[0]}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : textarea ? (
        <Textarea className="min-h-24" />
      ) : (
        <Input type={password ? "password" : "text"} />
      )}
    </label>
  );
}

function DropdownOptionBuilder({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const [value, setValue] = useState("");

  const addOption = () => {
    const nextValue = value.trim();
    if (!nextValue || options.includes(nextValue)) return;
    onChange([...options, nextValue]);
    setValue("");
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-foreground">
        Dropdown Options
      </span>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addOption();
            }
          }}
          placeholder="Enter option"
        />
        <Button
          type="button"
          size="icon"
          onClick={addOption}
          aria-label="Add option"
        >
          <PlusIcon size={15} />
        </Button>
      </div>
      {options.length ? (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <span
              key={option}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-medium text-foreground"
            >
              {option}
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive"
                onClick={() =>
                  onChange(options.filter((item) => item !== option))
                }
                aria-label={`Remove ${option}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="border-b border-border/70 pb-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function EditField({
  label,
  defaultValue = "",
  select,
  textarea,
  options = [],
  onValueChange,
}: {
  label: string;
  defaultValue?: string;
  select?: boolean;
  textarea?: boolean;
  options?: string[];
  onValueChange?: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {select ? (
        <Select
          defaultValue={defaultValue || options[0]}
          onValueChange={(value) => {
            if (value) onValueChange?.(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : textarea ? (
        <Textarea defaultValue={defaultValue} className="min-h-24" />
      ) : (
        <Input defaultValue={defaultValue} />
      )}
    </label>
  );
}

function EditDateField({
  label,
  defaultValue = "",
}: {
  label: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <label className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <DatePicker value={value} onChange={setValue} />
    </label>
  );
}

function SettingsPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-lg bg-muted/30 px-3 py-2 text-sm font-medium text-foreground"
          >
            {item}
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-3">
        Edit
      </Button>
    </section>
  );
}

function IconActions({
  preview,
  download,
  remove,
  edit,
}: {
  preview?: boolean;
  download?: boolean;
  remove?: boolean;
  edit?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {preview ? (
        <ActionIcon label="Preview" icon={<EyeIcon size={15} />} />
      ) : null}
      {download ? (
        <ActionIcon label="Download" icon={<DownloadSimpleIcon size={15} />} />
      ) : null}
      {edit ? (
        <ActionIcon label="Edit" icon={<NotePencilIcon size={15} />} />
      ) : null}
      {remove ? (
        <ActionIcon label="Delete" icon={<TrashIcon size={15} />} />
      ) : null}
    </div>
  );
}

function ActionIcon({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <ActionTooltip label={label}>
      <button
        type="button"
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        aria-label={label}
      >
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
