"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { useBulkDeleteProjects, useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import type { Project } from "../types/project.types";

type ProjectMasterSheetRow = {
  id: string;
  values: Record<string, string>;
};

const FIELDS: { key: string; label: string; width: number }[] = [
  { key: "name", label: "Project Name", width: 320 },
  { key: "code", label: "Project Code", width: 220 },
  { key: "city", label: "City", width: 130 },
  { key: "client", label: "Client", width: 240 },
  { key: "consultant", label: "Consultant", width: 200 },
  { key: "contractor", label: "Contractor", width: 180 },
  { key: "projectType", label: "Project Type", width: 160 },
  { key: "startDate", label: "Start Date", width: 130 },
  { key: "plannedEndDate", label: "End Date", width: 130 },
  { key: "status", label: "Status", width: 140 },
  { key: "contractValue", label: "Contract Value", width: 150 },
  { key: "assignedManager", label: "Project Manager", width: 180 },
  { key: "description", label: "Description", width: 360 },
];

// Every column keeps the Excel-style value filter it had on ExcelDataGrid (all
// projects are loaded client-side). Name and code stay pinned.
const columns: ListColumn<ProjectMasterSheetRow>[] = FIELDS.map((field) => ({
  id: field.key,
  header: field.label,
  width: field.width,
  // Contract value is a formatted currency string ("₹1,50,000"); sort/filter on the number, display the text.
  value: field.key === "contractValue" ? (row) => parseAmount(row.values.contractValue) : (row) => row.values[field.key],
  cell: field.key === "contractValue" ? (row) => row.values.contractValue || "—" : undefined,
  columnFilter: true,
  sortable: field.key !== "description",
  isTitle: field.key === "name",
  hideable: field.key !== "name",
  pin: field.key === "name" || field.key === "code",
  align: field.key === "contractValue" ? "end" : undefined,
}));

function parseAmount(value: string | null | undefined) {
  const amount = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return value && Number.isFinite(amount) ? amount : null;
}

const exportColumns: ExportColumn<ProjectMasterSheetRow>[] = FIELDS.map((field) => ({
  label: field.label,
  getValue: (row) => row.values[field.key],
}));

export function ProjectsList() {
  const router = useRouter();
  const list = useListState({ pageSize: 50, storageKey: "projects" });
  const { data: projects = [], isLoading, isError, refetch } = useProjectsQuery();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const bulkDelete = useBulkDeleteProjects();

  const rows = useMemo(() => projects.map(projectToMasterSheetRow), [projects]);
  // Search matches every column value, as before.
  const { rows: filteredRows, pageRows, total } = useClientRows(rows, list, { columns });

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(Array.from(list.selection));
    list.clearSelection();
    setDeleteOpen(false);
  }

  return (
    <PageShell
      title="Projects"
      description="All CGD projects with their client, contractor and schedule."
      actions={
        // Use a full page load so creation does not depend on client navigation.
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a href="/projects/new" className={buttonVariants({ variant: "default", size: "compact" })}>
          <PlusIcon size={13} />
          New Project
        </a>
      }
    >
      <ListTable
        itemLabel="project"
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        searchPlaceholder="Search projects..."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        enableFullView
        maxHeightClassName="max-h-[calc(100vh-320px)]"
        onRowClick={(row) => router.push(`/projects/${row.id}`)}
        selectable
        getRowLabel={(row) => row.values.name}
        bulkActions={() => (
          <Button type="button" size="compact" variant="ghost" onClick={() => setDeleteOpen(true)}>
            <TrashIcon size={14} />
            Delete
          </Button>
        )}
        empty={{
          illustration: "projects",
          title: "No projects yet",
          description: "Create a project to start tracking sites, customers and billing.",
          action: { label: "New project", onClick: () => window.location.assign("/projects/new") },
        }}
        actions={
          <Button variant="outline" size="compact" disabled={filteredRows.length === 0} onClick={() => void exportRowsToExcel("projects.xlsx", exportColumns, filteredRows)}>
            <DownloadSimpleIcon size={14} />
            Export
          </Button>
        }
      />

      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={list.selection.size}
        entityLabel="Project"
        isSubmitting={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        recoverable
        note="Everything linked to them (customers, sites, documents, bills, DPRs) goes with them."
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
