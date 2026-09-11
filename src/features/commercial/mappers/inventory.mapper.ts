import type { PlumberBalance } from "../types/material.types";

export type PlumberBalanceRow = PlumberBalance & { id: string };

/**
 * Plumber balance rows already carry plumberName/projectName/materialName
 * (server-joined in materialsService.plumberBalances) - this just adds a
 * stable row id for the grid.
 *
 * totalIssueRows() and consumptionLogRows() (client-side GROUP BY and
 * multi-type merge/sort) were removed - InventoryPage now gets both
 * server-side: the Total Issue tab from materialsApi.totalIssueSummary()
 * (a real GROUP BY materialId), and the Consumption Log tab from a single
 * listTransactionsPage({ types: ["consumption","pbg_consumption"] }) call
 * instead of two separate fetches merged/sorted client-side.
 */
export function plumberBalanceRows(plumberBalances: PlumberBalance[]): PlumberBalanceRow[] {
  return plumberBalances.map((row) => ({
    ...row,
    id: `${row.plumberId}-${row.materialId}-${row.source || "unspecified"}-${row.projectId || "none"}`,
  }));
}
