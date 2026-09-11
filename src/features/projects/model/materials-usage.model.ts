import type { MaterialTransaction } from "@/features/commercial/types/material.types";

export type MaterialUsageRow = {
  id: string;
  name: string;
  issued: number;
  consumed: number;
  returned: number;
};

export function buildMaterialUsageRows(transactions: MaterialTransaction[]): MaterialUsageRow[] {
  const map = new Map<string, { name: string; issued: number; consumed: number; returned: number }>();
  for (const row of transactions) {
    // Server-joined on the transaction row - no full materials list needed.
    const name = row.materialName || "Unknown material";
    const entry = map.get(row.materialId) ?? { name, issued: 0, consumed: 0, returned: 0 };
    if (row.type === "issue" || row.type === "pbg_issue") entry.issued += row.quantity;
    else if (row.type === "consumption" || row.type === "pbg_consumption") entry.consumed += row.quantity;
    else if (row.type === "return") entry.returned += row.quantity;
    map.set(row.materialId, entry);
  }
  return Array.from(map.entries()).map(([id, value]) => ({ id, ...value }));
}
