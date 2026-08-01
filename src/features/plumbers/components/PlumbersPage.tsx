"use client";

import { useMemo, useState } from "react";
import { NotePencilIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageShell } from "@/features/management/components/shared/PageShell";
import { PaginatedDataTable } from "@/features/management/components/shared/PaginatedDataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDeletePlumber, usePlumbersQuery } from "../hooks/usePlumbers";
import { PlumberDrawer } from "./PlumberDrawer";
import type { Plumber } from "../types/plumber.types";

export function PlumbersPage() {
  const [filters, setFilters] = useState({ search: "", type: "all", status: "all" });
  const { data: plumbers = [] } = usePlumbersQuery(filters.search || undefined);
  const deletePlumber = useDeletePlumber();
  const [drawerState, setDrawerState] = useState<{ open: boolean; plumber?: Plumber }>({ open: false });

  const filteredPlumbers = useMemo(
    () =>
      plumbers.filter(
        (plumber) =>
          (filters.type === "all" || plumber.type === filters.type) &&
          (filters.status === "all" || plumber.status === filters.status),
      ),
    [plumbers, filters.type, filters.status],
  );

  async function handleDelete(plumber: Plumber) {
    if (!window.confirm(`Remove "${plumber.name}" from the plumber roster?`)) return;
    await deletePlumber.mutateAsync(plumber.id);
  }

  const columns: ColumnDef<Plumber>[] = [
    { key: "name", header: "Name", render: (row) => <b>{row.name}</b> },
    {
      key: "type",
      header: "Type",
      render: (row) => (row.type === "team" ? "Team" : "Individual"),
    },
    { key: "contactNumber", header: "Contact Number" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status === "active" ? "Active" : "Inactive"} />,
    },
    { key: "remarks", header: "Remarks" },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDrawerState({ open: true, plumber: row })}
          >
            <NotePencilIcon size={15} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row)}
            disabled={deletePlumber.isPending}
          >
            <TrashIcon size={15} className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Plumbers"
      subtitle="Roster of individual plumbers and named teams/crews assigned to customer connections."
      actions={
        <Button type="button" onClick={() => setDrawerState({ open: true })}>
          <PlusIcon size={15} />
          Add Plumber
        </Button>
      }
    >
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search plumbers..."
        title="Plumber Filters"
        values={filters}
        filters={[
          {
            key: "type",
            placeholder: "All Types",
            options: [
              { value: "individual", label: "Individual" },
              { value: "team", label: "Team" },
            ],
          },
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({ search: "", type: "all", status: "all" })}
      />
      <PaginatedDataTable data={filteredPlumbers} columns={columns} />

      <PlumberDrawer
        key={drawerState.plumber?.id ?? "new"}
        open={drawerState.open}
        onOpenChange={(open) => setDrawerState((current) => ({ ...current, open }))}
        plumber={drawerState.plumber}
      />
    </PageShell>
  );
}
