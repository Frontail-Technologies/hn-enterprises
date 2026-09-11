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
import { DPR_DONE_STATUSES } from "../model/planning-entry.rules";
import type { DprRecord, SitePlan } from "../types/planning.types";
import { customerLabel, taskSummary } from "./planning-table.utils";

export function PlanningTable({
  rows,
  dprByKey,
  projectNameById,
  date,
}: {
  rows: SitePlan[];
  dprByKey: Map<string, DprRecord>;
  projectNameById: Map<string, string>;
  date: string;
}) {
  return (
    <Table className="min-w-[900px]">
      <TableHeader>
        <TableRow className="bg-table-header/85 text-xs font-semibold text-muted-foreground">
          <TableHead>Supervisor</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Customer / BP</TableHead>
          <TableHead>Planned Work</TableHead>
          <TableHead className="w-32">Status</TableHead>
          <TableHead className="w-16">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const summary = taskSummary(row.tasks);
          const matchedDpr = dprByKey.get(`${row.supervisorId}-${row.customerId}`);
          const done = matchedDpr && DPR_DONE_STATUSES.has(matchedDpr.status);
          return (
            <TableRow key={row.id} className="bg-card hover:bg-muted/25">
              <TableCell className="whitespace-normal font-medium text-foreground">{row.supervisorName}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">{projectNameById.get(row.projectId) ?? "—"}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">{row.siteLabel || "—"}</TableCell>
              <TableCell className="whitespace-normal text-foreground">{customerLabel(row.customerName, row.customerTrBpNo)}</TableCell>
              <TableCell className="max-w-[280px] truncate text-muted-foreground" title={summary}>
                {summary || "—"}
              </TableCell>
              <TableCell>
                <StatusBadge status={done ? "Completed" : matchedDpr ? "In Progress" : "Pending"} />
              </TableCell>
              <TableCell>
                <Link
                  href={`/planning/plan?supervisorId=${row.supervisorId}&customerId=${row.customerId}&date=${date}`}
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
