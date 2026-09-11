"use client";

import { useState } from "react";
import { DataTable, type ColumnDef, type DataTableSelection } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { FullViewPortal } from "@/components/shared/table/FullViewPortal";
import { FullViewToggleButton } from "@/components/shared/table/FullViewToggleButton";
import { cn } from "@/lib/utils";

export function PaginatedDataTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 50,
  isLoading,
  stickyLastColumn = true,
  selection,
  enableFullView = false,
  showEmptyTable = false,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  isLoading?: boolean;
  stickyLastColumn?: boolean;
  selection?: DataTableSelection<T>;
  enableFullView?: boolean;
  showEmptyTable?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [fullView, setFullView] = useState(false);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = data.slice(startIndex, startIndex + pageSize);
  const startItem = data.length ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + pagedData.length, data.length);

  return (
    <FullViewPortal active={fullView} onExit={() => setFullView(false)}>
      <div className={cn("space-y-2", fullView && "flex h-full min-h-0 flex-1 flex-col")}>
        <div className="flex shrink-0 items-center justify-between gap-2">
          <Pagination
            compact
            page={currentPage}
            pageCount={pageCount}
            totalItems={data.length}
            startItem={startItem}
            endItem={endItem}
            onPageChange={setPage}
          />
          {enableFullView ? (
            <FullViewToggleButton active={fullView} onToggle={() => setFullView((current) => !current)} />
          ) : null}
        </div>
        <div className={cn(fullView && "min-h-0 flex-1 overflow-hidden")}>
          <DataTable
            data={pagedData}
            columns={columns}
            serialNumberStart={startIndex + 1}
            stickyHeader
            stickyLastColumn={stickyLastColumn}
            isLoading={isLoading}
            selection={selection}
            fillHeight={fullView}
            showEmptyTable={showEmptyTable}
          />
        </div>
      </div>
    </FullViewPortal>
  );
}
