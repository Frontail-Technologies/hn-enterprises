"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { PageShell } from "@/components/shared/PageShell";
import { TablePanel } from "@/components/shared/TablePanel";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useBulkDeleteProjects, useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { exportRowsToExcel } from "@/lib/export-excel";
import type { Project } from "../types/project.types";

type ProjectMasterSheetRow = {
  id: string;
  values: Record<string, string>;
};

const projectMasterSheetColumns: ExcelColumn<ProjectMasterSheetRow>[] = [
  {
    key: "name",
    label: "Project Name",
    width: 240,
    sticky: true,
    getValue: (row) => row.values.name,
  },
  {
    key: "code",
    label: "Project Code",
    width: 150,
    sticky: true,
    getValue: (row) => row.values.code,
  },
  { key: "city", label: "City", width: 130, getValue: (row) => row.values.city },
  { key: "client", label: "Client", width: 260, getValue: (row) => row.values.client },
  { key: "consultant", label: "Consultant", width: 220, getValue: (row) => row.values.consultant },
  { key: "contractor", label: "Contractor", width: 180, getValue: (row) => row.values.contractor },
  { key: "projectType", label: "Project Type", width: 160, getValue: (row) => row.values.projectType },
  { key: "startDate", label: "Start Date", width: 130, getValue: (row) => row.values.startDate },
  { key: "plannedEndDate", label: "End Date", width: 130, getValue: (row) => row.values.plannedEndDate },
  { key: "status", label: "Status", width: 140, getValue: (row) => row.values.status },
  { key: "contractValue", label: "Contract Value", width: 150, getValue: (row) => row.values.contractValue },
  { key: "assignedManager", label: "Project Manager", width: 180, getValue: (row) => row.values.assignedManager },
  { key: "description", label: "Description", width: 360, getValue: (row) => row.values.description },
];

export function ProjectsList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: projects = [], isLoading } = useProjectsQuery();
  const { selectedIds, toggleRow, toggleAllOnPage, clear } = useBulkSelection();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteProjects();

  const rows = useMemo(() => projects.map(projectToMasterSheetRow), [projects]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) =>
      projectMasterSheetColumns.some((column) =>
        String(column.getValue(row) ?? "").toLowerCase().includes(query),
      ),
    );
  }, [rows, search]);

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    clear();
    setDeleteOpen(false);
  }

  return (
    <PageShell
      title="Projects"
      subtitle="Manage project contracts, cities, clients, and status."
      actions={
        <>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={() => void exportRowsToExcel("projects.xlsx", projectMasterSheetColumns, filteredRows)}
          >
            <DownloadSimpleIcon size={15} />
            Export Excel
          </button>
          <Link
            href="/projects/new"
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            <PlusIcon size={15} />
            New Project
          </Link>
        </>
      }
    >
      <TablePanel
        title="Project Master Sheet"
        subtitle="Excel-style project data with fixed project columns and per-column filters."
        toolbar={
          <div className="relative max-w-md">
            <MagnifyingGlassIcon
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              className="h-9 pl-9"
            />
          </div>
        }
      >
        <BulkDeleteBar selectedCount={selectedIds.size} onClear={clear} onDelete={() => setDeleteOpen(true)} />
        <ExcelDataGrid
          columns={projectMasterSheetColumns}
          rows={filteredRows}
          emptyTitle="No project master records found"
          isLoading={isLoading}
          onRowClick={(row) => router.push(`/projects/${row.id}`)}
          selection={{
            selectedIds,
            onToggleRow: toggleRow,
            onTogglePage: toggleAllOnPage,
            getRowLabel: (row) => row.values.name,
          }}
        />
      </TablePanel>

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={selectedIds.size}
        entityLabel="Project"
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        note="Projects with associated records (e.g. customers or sites) will be skipped with an error instead of partially deleted."
      />
    </PageShell>
  );
}

function projectToMasterSheetRow(project: Project): ProjectMasterSheetRow {
  return {
    id: project.id,
    values: {
      name: project.name,
      code: project.code,
      city: project.city,
      client: project.client,
      consultant: project.consultant,
      contractor: project.contractor,
      projectType: project.projectType,
      startDate: project.startDate,
      plannedEndDate: project.plannedEndDate,
      status: project.status,
      contractValue: project.contractValue,
      assignedManager: project.assignedManager,
      description: project.description,
    },
  };
}
