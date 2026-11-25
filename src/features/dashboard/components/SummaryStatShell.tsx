"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import type { EmptyIllustrationName } from "@/components/shared/EmptyState";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { buttonVariants } from "@/components/ui/button";

export function SummaryStatShell<T extends { id: string }>({
  title,
  description,
  searchPlaceholder,
  columns,
  rows,
  isLoading,
  isError,
  onRetry,
  emptyTitle,
  emptyIllustration,
  getRowHref,
}: {
  title: string;
  description?: string;
  searchPlaceholder: string;
  columns: ListColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle: string;
  emptyIllustration?: EmptyIllustrationName;
  /** Where a row click goes (undefined = that row isn't clickable). */
  getRowHref?: (row: T) => string | undefined;
}) {
  const router = useRouter();
  const list = useListState({ pageSize: 50, storageKey: `dashboard-summary:${title}` });
  // Search covers every column's value, as before; sort and paging run on the loaded rows.
  const { pageRows, total } = useClientRows(rows, list, { columns });

  return (
    <PageShell
      title={title}
      description={description}
      actions={
        <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ArrowLeftIcon size={14} />
          Back
        </Link>
      }
    >
      <ListTable
        onRowClick={
          getRowHref
            ? (row) => {
                const href = getRowHref(row);
                if (href) router.push(href);
              }
            : undefined
        }
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        searchPlaceholder={searchPlaceholder}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        maxHeightClassName="max-h-[68vh]"
        empty={{ title: emptyTitle, illustration: emptyIllustration }}
      />
    </PageShell>
  );
}
