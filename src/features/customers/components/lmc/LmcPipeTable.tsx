"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { deriveLmcPipeCurrentStage } from "../../model/lmc-pipeline.rules";
import type { LmcEvidenceFile, LmcPipeSizeRecord } from "../../types/customer.types";

/**
 * Shared LMC pipe-record table presentation (§6 of the Checkpoint B brief).
 * Owns no save behavior - it just renders `records` and calls `onEditRecord`
 * on row/Edit click. The date and evidence cells render differently between
 * `LmcPipelineForm` (raw date strings, an evidence count badge) and
 * `LmcPipelineDetail` (formatted dates, evidence thumbnails), so those two
 * cells are supplied by the caller to preserve each surface's existing
 * appearance rather than forcing one visual onto both.
 */
export function LmcPipeTable({
  records,
  onEditRecord,
  renderDate,
  renderEvidence,
}: {
  records: LmcPipeSizeRecord[];
  onEditRecord: (id: string) => void;
  renderDate?: (value: string) => ReactNode;
  renderEvidence: (files: LmcEvidenceFile[]) => ReactNode;
}) {
  const date = renderDate ?? ((value: string) => value || "-");

  return (
    <div className="overflow-hidden rounded-lg border border-border/50 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 bg-muted/35 hover:bg-muted/35">
            <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Pipe Size</TableHead>
            <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Length</TableHead>
            <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Laying Date</TableHead>
            <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Testing Date</TableHead>
            <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Purging Date</TableHead>
            <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Current Stage</TableHead>
            <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Evidence</TableHead>
            <TableHead className="h-8 px-3 text-right text-xs font-semibold text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record.id}
              className="cursor-pointer border-border/45 bg-card hover:bg-muted/30"
              onClick={() => onEditRecord(record.id)}
            >
              <TableCell className="px-3 py-2 font-semibold text-foreground">{record.pipeSize}</TableCell>
              <TableCell className="px-3 py-2 text-muted-foreground">{record.lengthMetres || "-"}</TableCell>
              <TableCell className="px-3 py-2 text-muted-foreground">{date(record.layingDate)}</TableCell>
              <TableCell className="px-3 py-2 text-muted-foreground">{date(record.testingDate)}</TableCell>
              <TableCell className="px-3 py-2 text-muted-foreground">{date(record.purgingDate)}</TableCell>
              <TableCell className="px-3 py-2"><StatusBadge status={deriveLmcPipeCurrentStage(record)} /></TableCell>
              <TableCell className="px-3 py-2 text-muted-foreground">{renderEvidence(record.evidence)}</TableCell>
              <TableCell className="px-3 py-2 text-right">
                <Button type="button" variant="ghost" size="sm" onClick={() => onEditRecord(record.id)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
