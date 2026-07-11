import { useMemo, useState } from "react";

interface UsePaginationOptions<T> {
  items: T[];
  pageSize?: number;
  initialPage?: number;
}

export function usePagination<T>({
  items,
  pageSize = 10,
  initialPage = 1,
}: UsePaginationOptions<T>) {
  const [page, setPage] = useState(initialPage);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  const startItem = items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, items.length);

  return {
    page: currentPage,
    pageCount,
    pageSize,
    totalItems: items.length,
    startItem,
    endItem,
    paginatedItems,
    setPage: (nextPage: number) => setPage(clampPage(nextPage, pageCount)),
    nextPage: () => setPage((current) => clampPage(current + 1, pageCount)),
    previousPage: () => setPage((current) => clampPage(current - 1, pageCount)),
  };
}

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(page, 1), pageCount);
}
