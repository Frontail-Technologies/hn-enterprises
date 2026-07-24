"use client";

import { useMemo, useState } from "react";
import { NotePencilIcon } from "@phosphor-icons/react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { DrawerShell } from "@/components/shared/DrawerShell";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { QuickField } from "@/components/shared/QuickField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { roles, users } from "../data/users.data";
import { formatDateTime, uniqOptions } from "../utils/format";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

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

function UserDrawer({
  mode = "add",
  iconOnly = false,
}: {
  mode?: "add" | "edit";
  iconOnly?: boolean;
}) {
  return (
    <DrawerShell
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
      <QuickField label="Name" />
      <QuickField label="Contact" />
      <QuickField label="Username" />
      <QuickField label="Role" select options={roles} />
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
          <QuickField
            label={mode === "edit" ? "New Password" : "Password"}
            password
          />
          <QuickField label="Confirm Password" password />
        </div>
      </div>
      <QuickField label="Permissions" textarea />
    </DrawerShell>
  );
}
