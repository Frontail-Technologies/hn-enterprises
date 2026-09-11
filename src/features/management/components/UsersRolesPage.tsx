"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, MagnifyingGlassIcon, UploadSimpleIcon, UserGearIcon } from "@phosphor-icons/react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { FilterDialog } from "@/components/shared/FilterDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useDownloadUserRegister } from "@/features/exports/hooks/useExports";
import { useUsersQuery } from "../hooks/useUsers";
import { formatDateTime, uniqOptions } from "../utils/format";
import { ROLE_TO_BACKEND, STATUS_TO_BACKEND, type User, type UserRole, type UserStatus } from "../services/users.service";
import { UserDialog } from "./UserDialog";
import { DeleteImpactAction } from "@/components/shared/DeleteImpactAction";
import { useBulkDeleteUsers, useDeleteUser, useUserDeleteImpactQuery } from "../hooks/useUsers";
import { PageShell } from "@/components/shared/PageShell";
import { PaginatedDataTable } from "@/components/shared/PaginatedDataTable";

export function UsersRolesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });
  const { data: users = [], isLoading } = useUsersQuery();
  const { selectedIds, toggleRow, toggleAllOnPage, clear } = useBulkSelection();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteUsers();
  const downloadRegister = useDownloadUserRegister();

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    setDeleteOpen(false);
    clear();
  }

  function handleExportRegister() {
    downloadRegister.mutate({
      role: filters.role === "all" ? undefined : ROLE_TO_BACKEND[filters.role as UserRole],
      status: filters.status === "all" ? undefined : STATUS_TO_BACKEND[filters.status as UserStatus],
      search: filters.search || undefined,
    });
  }
  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return users.filter(
      (row) =>
        (row.role === "Super Admin" || row.role === "Supervisor") &&
        (!search ||
          row.name.toLowerCase().includes(search) ||
          row.username.toLowerCase().includes(search) ||
          row.mobile.toLowerCase().includes(search)) &&
        (filters.role === "all" || row.role === filters.role) &&
        (filters.status === "all" || row.status === filters.status),
    );
  }, [users, filters]);
  const columns: ColumnDef<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div className="flex flex-col">
          <b>{row.name}</b>
          <span className="text-xs text-muted-foreground">{row.username}</span>
        </div>
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
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <UserDialog user={row} iconOnly />
          <UserDeleteAction user={row} />
        </div>
      ),
    },
  ];
  return (
    <PageShell
      title="Users & Roles"
      icon={UserGearIcon}
      actions={
        <>
          <div className="relative min-w-0 sm:w-60">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
            <Input
              placeholder="Search user or username..."
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="h-8 w-full max-w-full pl-8 sm:w-60"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:contents">
            <FilterDialog
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
              onReset={() => setFilters((current) => ({ ...current, role: "all", status: "all" }))}
            />

            <Button type="button" variant="outline" size="compact" onClick={handleExportRegister} disabled={downloadRegister.isPending}>
              <DownloadSimpleIcon size={12} />
              {downloadRegister.isPending ? "Exporting..." : "Export"}
            </Button>

            <Button type="button" variant="outline" size="compact" onClick={() => router.push("/users/import")}>
              <UploadSimpleIcon size={12} />
              Import
            </Button>
          </div>

          <UserDialog />
        </>
      }
      contentClassName="space-y-3"
    >
      <BulkDeleteBar selectedCount={selectedIds.size} onClear={clear} onDelete={() => setDeleteOpen(true)} />
      <PaginatedDataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        enableFullView
        selection={{
          selectedIds,
          onToggleRow: toggleRow,
          onTogglePage: toggleAllOnPage,
          getRowLabel: (row) => row.name,
        }}
      />

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={selectedIds.size}
        entityLabel="User"
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        note="Users with associated records will be skipped with an error instead of partially deleted. Your own account is never deleted even if selected."
      />
    </PageShell>
  );
}

function UserDeleteAction({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const deleteUser = useDeleteUser();
  const deleteImpact = useUserDeleteImpactQuery(user.id, { enabled: open });

  // No dependency ever blocks this anymore (remove-staff-block brief §7) -
  // there is deliberately no "Deactivate" fallback action here; a forced
  // deactivate-instead-of-delete path no longer applies to any user.
  const activeAssignments = deleteImpact.data?.dependencies.find((d) => d.key === "activeSiteAssignments");
  const note = activeAssignments && activeAssignments.count > 0
    ? `This will remove the user account, remove the current staff profile (if any), and release the email/mobile/login identifiers for reuse. Historical activity, audit records and payroll/business history will be preserved. This user's ${activeAssignments.count} active site assignment${activeAssignments.count === 1 ? "" : "s"} will become Unassigned.`
    : "This will remove the user account, remove the current staff profile (if any), and release the email/mobile/login identifiers for reuse. Historical activity, audit records and payroll/business history will be preserved.";

  return (
    <DeleteImpactAction
      open={open}
      onOpenChange={setOpen}
      itemName={user.name}
      entityTypeLabel="User"
      impact={deleteImpact.data}
      note={note}
      confirmLabel="Delete Permanently"
      isImpactLoading={deleteImpact.isLoading}
      isImpactError={deleteImpact.isError}
      onRetryImpact={() => void deleteImpact.refetch()}
      isDeleting={deleteUser.isPending}
      onDelete={() => deleteUser.mutateAsync(user.id)}
    />
  );
}
