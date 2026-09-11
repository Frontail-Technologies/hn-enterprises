import { Fragment } from "react";
import Link from "next/link";
import { ArrowSquareOutIcon, CaretDownIcon } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SupervisorGroup } from "../model/planning-entry.rules";
import { customerLabel, taskSummary } from "./planning-table.utils";
import { OverviewStatusPill } from "./OverviewStatusPill";

export function SupervisorOverviewTable({
  groups,
  expanded,
  onToggle,
  date,
}: {
  groups: SupervisorGroup[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  date: string;
}) {
  return (
    <Table className="min-w-[760px]">
      <TableHeader>
        <TableRow className="bg-table-header/85 text-xs font-semibold text-muted-foreground">
          <TableHead className="w-8" />
          <TableHead>Supervisor</TableHead>
          <TableHead>Sites Touched</TableHead>
          <TableHead className="w-24 text-right">Planned</TableHead>
          <TableHead className="w-24 text-right">DPR Done</TableHead>
          <TableHead className="w-24 text-right">Pending</TableHead>
          <TableHead className="w-28">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => {
          const isOpen = expanded.has(group.supervisorId);
          return (
            <Fragment key={group.supervisorId}>
              <TableRow
                className="cursor-pointer bg-card hover:bg-muted/25"
                onClick={() => onToggle(group.supervisorId)}
              >
                <TableCell className="text-center">
                  <CaretDownIcon size={13} className={cn("mx-auto transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                </TableCell>
                <TableCell className="whitespace-normal font-semibold text-foreground">{group.supervisorName}</TableCell>
                <TableCell className="text-muted-foreground">{group.rows.length}</TableCell>
                <TableCell className="text-right tabular-nums">{group.planned}</TableCell>
                <TableCell className="text-right tabular-nums">{group.dprDone}</TableCell>
                <TableCell className="text-right tabular-nums">{group.pending}</TableCell>
                <TableCell>
                  <OverviewStatusPill status={group.status} />
                </TableCell>
              </TableRow>
              {isOpen ? (
                <TableRow key={`${group.supervisorId}-detail`}>
                  <TableCell colSpan={7} className="bg-muted/20 p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[11px] font-semibold text-muted-foreground">
                          <TableHead className="py-1.5">Customer / BP</TableHead>
                          <TableHead className="py-1.5">Site</TableHead>
                          <TableHead className="py-1.5">Planned Work</TableHead>
                          <TableHead className="py-1.5">DPR Status</TableHead>
                          <TableHead className="py-1.5">Remarks</TableHead>
                          <TableHead className="py-1.5">Open</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.rows.map((row) => {
                          const summary = taskSummary(row.planTasks);
                          const linkParams = `supervisorId=${row.supervisorId}&customerId=${row.customerId}&date=${date}`;
                          return (
                            <TableRow key={row.customerId} className="hover:bg-muted/30">
                              <TableCell className="py-1.5 font-medium text-foreground">
                                {customerLabel(row.customerName, row.customerTrBpNo)}
                              </TableCell>
                              <TableCell className="py-1.5 text-muted-foreground">{row.siteArea || "—"}</TableCell>
                              <TableCell className="max-w-[260px] truncate py-1.5 text-muted-foreground" title={summary}>
                                {summary || "—"}
                              </TableCell>
                              <TableCell className="py-1.5">
                                <StatusBadge status={row.dprStatus} />
                              </TableCell>
                              <TableCell className="max-w-[220px] truncate py-1.5 text-muted-foreground" title={row.dprRemarks}>
                                {row.dprRemarks || "—"}
                              </TableCell>
                              <TableCell className="py-1.5">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/planning/plan?${linkParams}`}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                  >
                                    Plan <ArrowSquareOutIcon size={12} />
                                  </Link>
                                  <Link
                                    href={`/planning/dpr?${linkParams}`}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                  >
                                    DPR <ArrowSquareOutIcon size={12} />
                                  </Link>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
