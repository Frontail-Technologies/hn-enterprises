import { useState } from "react";
import Link from "next/link";
import { ArrowSquareOutIcon, TrashIcon } from "@phosphor-icons/react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeleteDpr } from "../hooks/usePlanning";
import type { DprRecord, SitePlan } from "../types/planning.types";
import { customerLabel, dprWorkSummary } from "./planning-table.utils";

/** Daily progress reports, with a link to each one and a delete for mistakes. */
export function DprTable({
  rows,
  planByKey,
  projectNameById,
  date,
  showDate = false,
}: {
  rows: DprRecord[];
  planByKey: Map<string, SitePlan>;
  projectNameById: Map<string, string>;
  date: string;
  /** Show a Date column (lists that span several days). */
  showDate?: boolean;
}) {
  const deleteDpr = useDeleteDpr();
  const [toDelete, setToDelete] = useState<DprRecord | null>(null);

  return (
    <>
      <Table className="min-w-[1080px]">
        <TableHeader>
          <TableRow className="bg-table-header/85 text-xs font-semibold text-muted-foreground">
            {showDate ? <TableHead className="w-28">Date</TableHead> : null}
            <TableHead>Supervisor</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Customer / BP</TableHead>
            <TableHead>Work Done</TableHead>
            <TableHead className="w-24 text-center">Progress</TableHead>
            <TableHead className="w-36">Status</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead className="w-28">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const summary = dprWorkSummary(row.tasks);
            const completed = row.tasks.filter((task) => task.completedQty.trim()).length;
            const hasMatchingPlan = planByKey.has(`${row.supervisorId}-${row.customerId}`);
            return (
              <TableRow key={row.id} className="bg-card hover:bg-muted/25">
                {showDate ? <TableCell className="tabular-nums text-muted-foreground">{row.date}</TableCell> : null}
                <TableCell className="whitespace-normal font-medium text-foreground">{row.supervisorName}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{projectNameById.get(row.projectId) || row.projectName || "—"}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{row.siteLabel || "—"}</TableCell>
                <TableCell className="whitespace-normal text-foreground">{customerLabel(row.customerName, row.customerTrBpNo)}</TableCell>
                <TableCell className="max-w-[240px] truncate text-muted-foreground" title={summary}>
                  {summary || "—"}
                </TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">
                  {completed}/{row.tasks.length}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={row.status} />
                    {!hasMatchingPlan && !showDate ? <span className="text-xs text-muted-foreground">No matching plan</span> : null}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground" title={row.remarks}>
                  {row.remarks || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/planning/dpr?supervisorId=${row.supervisorId}&customerId=${row.customerId}&date=${showDate ? row.date : date}`}
                      className="inline-flex items-center gap-1 px-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Open <ArrowSquareOutIcon size={12} />
                    </Link>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Delete DPR"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setToDelete(row)}
                    >
                      <TrashIcon size={13} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <DeleteConfirmDialog
        itemName={toDelete ? `DPR of ${toDelete.customerName || "this customer"} (${toDelete.date})` : "DPR"}
        isOpen={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        isConfirming={deleteDpr.isPending}
        description="It moves to the recycle bin and can be restored for 30 days."
        onConfirm={() => {
          if (!toDelete) return;
          deleteDpr.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </>
  );
}
