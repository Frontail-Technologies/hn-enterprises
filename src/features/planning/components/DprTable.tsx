import Link from "next/link";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DprRecord, SitePlan } from "../types/planning.types";
import { customerLabel, dprWorkSummary } from "./planning-table.utils";

export function DprTable({
  rows,
  planByKey,
  projectNameById,
  date,
}: {
  rows: DprRecord[];
  planByKey: Map<string, SitePlan>;
  projectNameById: Map<string, string>;
  date: string;
}) {
  return (
    <Table className="min-w-[1040px]">
      <TableHeader>
        <TableRow className="bg-table-header/85 text-xs font-semibold text-muted-foreground">
          <TableHead>Supervisor</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Customer / BP</TableHead>
          <TableHead>Work Done</TableHead>
          <TableHead className="w-24 text-center">Progress</TableHead>
          <TableHead className="w-28">Status</TableHead>
          <TableHead>Remarks</TableHead>
          <TableHead className="w-16">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const summary = dprWorkSummary(row.tasks);
          const completed = row.tasks.filter((task) => task.completedQty.trim()).length;
          const hasMatchingPlan = planByKey.has(`${row.supervisorId}-${row.customerId}`);
          return (
            <TableRow key={row.id} className="bg-card hover:bg-muted/25">
              <TableCell className="whitespace-normal font-medium text-foreground">{row.supervisorName}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">{projectNameById.get(row.projectId) ?? "—"}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">{row.siteLabel || "—"}</TableCell>
              <TableCell className="whitespace-normal text-foreground">{customerLabel(row.customerName, row.customerTrBpNo)}</TableCell>
              <TableCell className="max-w-[260px] truncate text-muted-foreground" title={summary}>
                {summary || "—"}
              </TableCell>
              <TableCell className="text-center tabular-nums text-muted-foreground">
                {completed}/{row.tasks.length}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <StatusBadge status={row.status} />
                  {!hasMatchingPlan ? <span className="text-[11px] text-muted-foreground">No matching plan</span> : null}
                </div>
              </TableCell>
              <TableCell className="max-w-[220px] truncate text-muted-foreground" title={row.remarks}>
                {row.remarks || "—"}
              </TableCell>
              <TableCell>
                <Link
                  href={`/planning/dpr?supervisorId=${row.supervisorId}&customerId=${row.customerId}&date=${date}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Open <ArrowSquareOutIcon size={12} />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
