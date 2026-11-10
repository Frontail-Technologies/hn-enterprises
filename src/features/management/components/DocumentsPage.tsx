"use client";

import { DownloadSimpleIcon, EyeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { ListTable, useClientRows, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { resolveFileUrl } from "@/lib/upload";
import { useDocumentsQuery } from "../hooks/useDocuments";
import type { DocumentModule, DocumentRow } from "../services/documents.service";
import { formatDate } from "../utils/format";
import { PageShell } from "@/components/shared/PageShell";

const exportColumns: ExportColumn<DocumentRow>[] = [
  { label: "Document Name", getValue: (row) => row.name },
  { label: "Category", getValue: (row) => row.category },
  { label: "Related Module", getValue: (row) => row.module },
  { label: "Related Record", getValue: (row) => row.relatedName },
  { label: "Date", getValue: (row) => formatDate(row.uploadedAt) },
  { label: "Status", getValue: (row) => row.status },
];

const filters: ListFilter[] = [
  {
    id: "module",
    label: "Module",
    quick: true,
    options: [
      { value: "Projects", label: "Projects" },
      { value: "Customers", label: "Customers" },
    ],
  },
];

const columns: ListColumn<DocumentRow>[] = [
  { id: "name", header: "Document name", value: (row) => row.name, isTitle: true, hideable: false, sortable: true, width: 260, grow: true },
  { id: "category", header: "Category", value: (row) => row.category, sortable: true, width: 160 },
  { id: "module", header: "Related module", value: (row) => row.module, sortable: true, width: 150 },
  { id: "relatedName", header: "Related record", value: (row) => row.relatedName, sortable: true, width: 220 },
  { id: "uploadedAt", header: "Date", value: (row) => row.uploadedAt, sortable: true, width: 130, cell: (row) => formatDate(row.uploadedAt) },
  { id: "status", header: "Status", value: (row) => row.status, sortable: true, width: 130, cell: (row) => <StatusBadge status={row.status} /> },
];

export function DocumentsPage() {
  const list = useListState({ pageSize: 50, storageKey: "documents" });
  // Search and module are filtered by the API (as before); sort and paging run on the loaded rows.
  const { data: documents = [], isLoading, isError, refetch } = useDocumentsQuery({
    search: list.debouncedSearch || undefined,
    module: (list.filters.module as DocumentModule | undefined) || undefined,
  });
  const { pageRows, total } = useClientRows(documents, list, { columns, clientSearch: false });

  return (
    <PageShell title="Documents" description="Files uploaded against projects and customers.">
      <ListTable
        itemLabel="document"
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        filters={filters}
        searchPlaceholder="Search document, category or record..."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        enableFullView
        empty={{ illustration: "documents", title: "No documents yet", description: "Files uploaded for projects and customers will appear here." }}
        rowActionsWidth={80}
        renderRowActions={(row) => <DocumentActions document={row} />}
        actions={
          <Button
            type="button"
            variant="outline"
            size="compact"
            disabled={documents.length === 0}
            onClick={() => void exportRowsToExcel("documents.xlsx", exportColumns, documents)}
          >
            <DownloadSimpleIcon size={14} />
            Export Excel
          </Button>
        }
      />
    </PageShell>
  );
}

function DocumentActions({ document }: { document: DocumentRow }) {
  const href = resolveFileUrl(document.fileUrl);

  return (
    <div className="flex items-center gap-0.5">
      <ActionTooltip label="Preview">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Preview ${document.name}`}
          className="text-muted-foreground hover:text-foreground"
          render={<a href={href} target="_blank" rel="noopener noreferrer" />}
        >
          <EyeIcon size={15} />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="Download">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Download ${document.name}`}
          className="text-muted-foreground hover:text-foreground"
          render={<a href={href} download={document.name} />}
        >
          <DownloadSimpleIcon size={15} />
        </Button>
      </ActionTooltip>
    </div>
  );
}
