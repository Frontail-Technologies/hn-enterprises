"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useUsersQuery } from "../hooks/useUsers";
import { formatDateTime, uniqOptions } from "../utils/format";
import type { User } from "../services/users.service";
import { UserDrawer } from "./UserDrawer";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

export function UsersRolesPage() {
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });
  const { data: users = [] } = useUsersQuery();
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return users.filter(
      (row) =>
        (!search ||
          row.name.toLowerCase().includes(search) ||
          row.username.toLowerCase().includes(search) ||
          row.mobile.toLowerCase().includes(search)) &&
        (filters.role === "all" || row.role === filters.role) &&
        (filters.status === "all" || row.status === filters.status),
    );
  }, [users, filters]);
  const columns: ColumnDef<User>[] = [
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
      render: (row) => (row.lastLogin ? formatDateTime(row.lastLogin) : "Never"),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: (row) => <UserDrawer user={row} iconOnly />,
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
