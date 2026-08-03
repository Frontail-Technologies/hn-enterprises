"use client";

import { useState } from "react";
import { DownloadSimpleIcon, EyeIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { resolveFileUrl } from "@/lib/upload";
import { useDocumentsQuery } from "../hooks/useDocuments";
import type { DocumentModule, DocumentRow } from "../services/documents.service";
import { formatDate } from "../utils/format";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

const exportColumns: ExportColumn<DocumentRow>[] = [
  { label: "Document Name", getValue: (row) => row.name },
  { label: "Category", getValue: (row) => row.category },
  { label: "Related Module", getValue: (row) => row.module },
  { label: "Related Record", getValue: (row) => row.relatedName },
  { label: "Date", getValue: (row) => formatDate(row.uploadedAt) },
  { label: "Status", getValue: (row) => row.status },
];

export function DocumentsPage() {
  const [filters, setFilters] = useState<{ search: string; module: string }>({ search: "", module: "all" });
  const { data: documents = [], isLoading } = useDocumentsQuery({
    search: filters.search || undefined,
    module: filters.module === "all" ? undefined : (filters.module as DocumentModule),
  });
  const columns: ColumnDef<DocumentRow>[] = [
    {
      key: "name",
      header: "Document Name",
      render: (row) => <b>{row.name}</b>,
    },
    { key: "category", header: "Category" },
    { key: "module", header: "Related Module" },
    { key: "relatedName", header: "Related Record" },
    { key: "uploadedAt", header: "Date", render: (row) => formatDate(row.uploadedAt) },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (row) => <DocumentActions document={row} />,
    },
  ];
  return (
    <PageShell
      title="Documents"
      subtitle="Central read-only view of documents uploaded on Projects and Customers."
      actions={
        <button
          type="button"
          className={buttonVariants({ variant: "outline", size: "default" })}
          onClick={() => void exportRowsToExcel("documents.xlsx", exportColumns, documents)}
        >
          <DownloadSimpleIcon size={15} />
          Export Excel
        </button>
      }
    >
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search document, category or record..."
        title="Document Filters"
        values={filters}
        filters={[
          {
            key: "module",
            placeholder: "All Modules",
            options: [
              { value: "Projects", label: "Projects" },
              { value: "Customers", label: "Customers" },
            ],
          },
        ]}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({ search: "", module: "all" })}
      />
      <PaginatedDataTable data={documents} columns={columns} isLoading={isLoading} />
    </PageShell>
  );
}

function DocumentActions({ document }: { document: DocumentRow }) {
  const href = resolveFileUrl(document.fileUrl);

  return (
    <div className="flex items-center gap-1">
      <ActionTooltip label="Preview">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label={`Preview ${document.name}`}
        >
          <EyeIcon size={15} />
        </a>
      </ActionTooltip>
      <ActionTooltip label="Download">
        <a
          href={href}
          download={document.name}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label={`Download ${document.name}`}
        >
          <DownloadSimpleIcon size={15} />
        </a>
      </ActionTooltip>
    </div>
  );
}
