import { StatusBadge } from "@/components/shared/StatusBadge";

export function StockStatus({
  row,
}: {
  row: { availableStock: number; reorderLevel: number; status: string };
}) {
  const status =
    row.availableStock <= 0
      ? "Out of Stock"
      : row.availableStock <= row.reorderLevel
        ? "Low Stock"
        : row.status;
  return <StatusBadge status={status} />;
}
