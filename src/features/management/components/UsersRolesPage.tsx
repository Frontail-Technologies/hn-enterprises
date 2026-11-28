"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { ListTable, useClientRows, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useDownloadUserRegister } from "@/features/exports/hooks/useExports";
import { useUsersQuery } from "../hooks/useUsers";
import { formatDateTime, uniqOptions } from "../utils/format";
import { ROLE_TO_BACKEND, STATUS_TO_BACKEND, type User, type UserRole, type UserStatus } from "../services/users.service";
import { UserDialog } from "./UserDialog";
import { DeleteImpactAction } from "@/components/shared/DeleteImpactAction";
import { useBulkDeleteUsers, useDeleteUser, useUserDeleteImpactQuery } from "../hooks/useUsers";
import { PageShell } from "@/components/shared/PageShell";

const columns: ListColumn<User>[] = [
  {
    id: "name",
    header: "Name",
    value: (row) => row.name,
    hideable: false,
    pin: true,
    sortable: true,
    width: 260,
    cell: (row) => (
      <>
        <span className="font-semibold text-foreground">{row.name}</span>
        <span className="text-muted-foreground"> · {row.username}</span>
      </>
    ),
  },
  { id: "role", header: "Role", value: (row) => row.designation ?? row.role, sortable: true, width: 160 },
  { id: "status", header: "Status", value: (row) => row.status, sortable: true, width: 130, cell: (row) => <StatusBadge status={row.status} /> },
  {
    id: "lastLogin",
    header: "Last login",
    value: (row) => row.lastLogin,
    sortable: true,
    width: 190,
    grow: true,
    cell: (row) => (row.lastLogin ? formatDateTime(row.lastLogin) : <span className="text-muted-foreground">Never</span>),
  },
];

const searchText = (row: User) => `${row.name} ${row.username} ${row.mobile}`;

export function UsersRolesPage() {
  const router = useRouter();
  const list = useListState({ pageSize: 50, storageKey: "users" });
  const { data: users = [], isLoading, isError, refetch } = useUsersQuery();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteUsers();
  const downloadRegister = useDownloadUserRegister();

  // Only admin-panel and supervisor accounts are listed here (unchanged).
  const panelUsers = useMemo(() => users.filter((row) => row.role === "Super Admin" || row.role === "Supervisor"), [users]);
  const filters: ListFilter[] = [
    { id: "role", label: "Role", quick: true, options: uniqOptions(users.map((row) => row.role)) },
    { id: "status", label: "Status", quick: true, options: uniqOptions(users.map((row) => row.status)) },
  ];
  const { pageRows, total } = useClientRows(panelUsers, list, { columns, filters, searchText });

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(list.selection));
    setDeleteOpen(false);
    list.clearSelection();
  }

  function handleExportRegister() {
    const role = list.filters.role as UserRole | undefined;
    const status = list.filters.status as UserStatus | undefined;
    downloadRegister.mutate({
      role: role ? ROLE_TO_BACKEND[role] : undefined,
      status: status ? STATUS_TO_BACKEND[status] : undefined,
      search: list.search || undefined,
    });
  }

  return (
    <PageShell title="Users & Roles" description="Admin and supervisor accounts that can sign in." actions={<UserDialog />}>
      <ListTable
        itemLabel="user"
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        filters={filters}
        searchPlaceholder="Search user or username..."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        enableFullView
        selectable
        getRowLabel={(row) => row.name}
        bulkActions={() => (
          <Button type="button" variant="ghost" size="compact" onClick={() => setDeleteOpen(true)}>
            <TrashIcon size={14} />
            Delete
          </Button>
        )}
        empty={{ illustration: "customers", title: "No users yet", description: "Add an admin or supervisor account to get started." }}
        rowActionsWidth={80}
        renderRowActions={(row) => (
          <div className="flex items-center gap-0.5">
            <UserDialog user={row} iconOnly />
            <UserDeleteAction user={row} />
          </div>
        )}
        actions={
          <>
            <Button type="button" variant="outline" size="compact" onClick={handleExportRegister} disabled={downloadRegister.isPending}>
              <DownloadSimpleIcon size={14} />
              {downloadRegister.isPending ? "Exporting..." : "Export"}
            </Button>
            <Button type="button" variant="outline" size="compact" onClick={() => router.push("/users/import")}>
              <UploadSimpleIcon size={14} />
              Import
            </Button>
          </>
        }
      />

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={list.selection.size}
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
