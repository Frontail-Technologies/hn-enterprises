"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EyeIcon, NotePencilIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { type ColumnDef } from "@/components/shared/DataTable";
import { DrawerShell } from "@/components/shared/DrawerShell";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { QuickField } from "@/components/shared/QuickField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { staff } from "../data/staff.data";
import { formatDateTime, uniqOptions } from "../utils/format";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

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
        <div className="flex items-center gap-1">
          <ActionTooltip label="View staff">
            <Link
              href={`/staff/${row.id}`}
              aria-label={`View ${row.name}`}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Edit staff">
            <Link
              href={`/staff/${row.id}/edit`}
              aria-label={`Edit ${row.name}`}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <NotePencilIcon size={15} />
            </Link>
          </ActionTooltip>
        </div>
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

function StaffDrawer({
  mode = "add",
  iconOnly = false,
}: {
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  return (
    <DrawerShell
      title={mode === "edit" ? "Edit Staff" : "Add Staff"}
      description="Create or update employee and team assignments."
      triggerLabel={mode === "edit" ? "Edit" : "Add Staff"}
      icon={mode === "edit" ? <NotePencilIcon size={15} /> : undefined}
      iconOnly={iconOnly}
    >
      <QuickField label="Name" />
      <QuickField label="Mobile" />
      <QuickField
        label="Role"
        select
        options={["Supervisor", "Field Executive", "Plumber Team", "Admin"]}
      />
      <QuickField label="Assigned Projects" />
      <QuickField label="Status" select options={["Active", "Inactive"]} />
    </DrawerShell>
  );
}
