"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useDownloadUserRegister } from "@/features/exports/hooks/useExports";
import { useUsersQuery } from "../hooks/useUsers";
import { formatDateTime, uniqOptions } from "../utils/format";
import { ROLE_TO_BACKEND, STATUS_TO_BACKEND, type User, type UserRole, type UserStatus } from "../services/users.service";
import { UserDrawer } from "./UserDrawer";
import { UserImportDialog } from "./staff/UserImportDialog";
import { DeleteImpactDialog } from "@/components/shared/DeleteImpactDialog";
import { useBulkDeleteUsers, useDeleteUser, useUpdateUser, useUserDeleteImpactQuery } from "../hooks/useUsers";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

export function UsersRolesPage() {
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });
  const { data: users = [], isLoading } = useUsersQuery();
  const { selectedIds, toggleRow, toggleAllOnPage, clear } = useBulkSelection();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const bulkDelete = useBulkDeleteUsers();
  const downloadRegister = useDownloadUserRegister();

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    setDeleteOpen(false);
    clear();
  }

  // Mirrors the page's own filtering exactly (§ data useMemo below): the
  // hardcoded Super Admin/Supervisor scope plus whatever the filter dropdowns
  // currently narrow to, translated to the backend's role/status casing.
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
          <UserDrawer user={row} iconOnly />
          <UserDeleteAction user={row} />
        </div>
      ),
    },
  ];
  return (
    <PageShell
      title="Users & Roles"
      subtitle="Admin access management and permission control."
      actions={
        <>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={handleExportRegister}
            disabled={downloadRegister.isPending}
          >
            <DownloadSimpleIcon size={15} />
            {downloadRegister.isPending ? "Exporting..." : "Export Excel"}
          </button>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={() => setImportOpen(true)}
          >
            <UploadSimpleIcon size={15} />
            Import Users
          </button>
          <UserDrawer />
        </>
      }
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
      <BulkDeleteBar selectedCount={selectedIds.size} onClear={clear} onDelete={() => setDeleteOpen(true)} />
      <PaginatedDataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
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

      <UserImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </PageShell>
  );
}

function UserDeleteAction({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const deleteUser = useDeleteUser();
  const deactivateUser = useUpdateUser(user.id);
  const deleteImpact = useUserDeleteImpactQuery(user.id, { enabled: open });

  return (
    <DeleteImpactDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Delete ${user.name}`}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <TrashIcon size={13} />
        </Button>
      }
      entityTypeLabel="User"
      impact={deleteImpact.data}
      isLoading={deleteImpact.isLoading}
      isError={deleteImpact.isError}
      onRetry={() => void deleteImpact.refetch()}
      isConfirming={deleteUser.isPending}
      onConfirm={async () => {
        await deleteUser.mutateAsync(user.id);
        setOpen(false);
      }}
      isArchiving={deactivateUser.isPending}
      archiveLabel="Deactivate User"
      onArchive={async () => {
        await deactivateUser.mutateAsync({
          name: user.name,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: "Inactive",
        });
        setOpen(false);
      }}
    />
  );
}
