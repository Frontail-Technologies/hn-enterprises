import type { PlumberBalance } from "../types/material.types";

export type PlumberLedgerRow = PlumberBalance & { id: string };

/**
 * Plumber balance rows already carry plumberName/projectName (server-joined
 * in materialsService.plumberBalances) - this just adds a stable row id for
 * the grid, no client-side name lookup needed any more.
 */
export function plumberLedgerRows(plumberBalances: PlumberBalance[]): PlumberLedgerRow[] {
  return plumberBalances.map((row) => ({
    ...row,
    id: `${row.plumberId}-${row.source || "unspecified"}-${row.projectId || "none"}`,
  }));
}
