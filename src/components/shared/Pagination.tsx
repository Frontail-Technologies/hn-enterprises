"use client";

import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  className?: string;
  compact?: boolean;
}

export function Pagination({
  page,
  pageCount,
  totalItems,
  startItem,
  endItem,
  onPageChange,
  className,
  compact,
}: PaginationProps) {
  const pages = getVisiblePages(page, pageCount);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        compact && "gap-2",
        className,
      )}
    >
      <p className="whitespace-nowrap text-xs font-medium text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} records
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <CaretDoubleLeftIcon size={14} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <CaretLeftIcon size={14} />
        </Button>

        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? "default" : "outline"}
            size="sm"
            className={cn("h-7 min-w-7 px-2", compact && "h-6 min-w-6 text-xs")}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <CaretRightIcon size={14} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page === pageCount}
          onClick={() => onPageChange(pageCount)}
          aria-label="Last page"
        >
          <CaretDoubleRightIcon size={14} />
        </Button>
      </div>
    </div>
  );
}

function getVisiblePages(page: number, pageCount: number) {
  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);
  const start = Math.max(1, Math.min(page - half, pageCount - maxVisible + 1));
  const end = Math.min(pageCount, start + maxVisible - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
