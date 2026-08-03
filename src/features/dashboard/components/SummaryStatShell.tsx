"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageShell } from "@/components/shared/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SummaryStatShell<T extends { id: string }>({
  title,
  searchPlaceholder,
  columns,
  rows,
  isLoading,
  emptyTitle,
}: {
  title: string;
  searchPlaceholder: string;
  columns: ExcelColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyTitle: string;
}) {
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) =>
      columns.some((column) => String(column.getValue(row) ?? "").toLowerCase().includes(query)),
    );
  }, [columns, rows, search]);

  return (
    <PageShell
      title={title}
      subtitle={`${filteredRows.length} of ${rows.length} records`}
      actions={
        <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ArrowLeftIcon size={14} />
          Back
        </Link>
      }
      contentClassName="space-y-3"
    >
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={searchPlaceholder}
        className="h-8 w-96 max-w-full"
      />
      <ExcelDataGrid
        columns={columns}
        rows={filteredRows}
        emptyTitle={emptyTitle}
        isLoading={isLoading}
        maxHeightClassName="max-h-[68vh]"
      />
    </PageShell>
  );
}
