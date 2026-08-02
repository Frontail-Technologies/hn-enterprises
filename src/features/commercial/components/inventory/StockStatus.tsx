import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Material } from "../../types/material.types";

export function StockStatus({ row }: { row: Pick<Material, "status"> }) {
  return <StatusBadge status={row.status} />;
}
