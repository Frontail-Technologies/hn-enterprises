import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";

export function PaginatedDataTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 6,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = data.slice(startIndex, startIndex + pageSize);
  const startItem = data.length ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + pagedData.length, data.length);

  return (
    <div className="space-y-3">
      <Pagination
        compact
        page={currentPage}
        pageCount={pageCount}
        totalItems={data.length}
        startItem={startItem}
        endItem={endItem}
        onPageChange={setPage}
      />
      <DataTable
        data={pagedData}
        columns={columns}
        serialNumberStart={startIndex + 1}
        stickyHeader
        stickyLastColumn
      />
    </div>
  );
}
