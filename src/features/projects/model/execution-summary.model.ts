import type { DprRecord } from "@/features/planning/types/planning.types";
import type { WorkQueueRow } from "@/features/work-progress/types/work-progress.types";

export type ExecutionSummary = {
  dprSubmitted: number;
  dprPending: number;
  giCompleted: number;
  gcCompleted: number;
  conversions: number;
};

export function computeExecutionSummary(dprRecords: DprRecord[], queueRows: WorkQueueRow[]): ExecutionSummary {
  const dprSubmitted = dprRecords.filter((row) => row.status !== "Draft").length;
  const dprPending = dprRecords.filter((row) => row.status === "Draft").length;
  const giCompleted = queueRows.filter((row) => row.stage === "Plumbing / GI" && row.status === "Completed").length;
  const gcCompleted = queueRows.filter((row) => row.stage === "GC" && row.status === "Completed").length;
  const conversions = queueRows.filter((row) => row.stage === "Conversion" && row.status === "Completed").length;

  return { dprSubmitted, dprPending, giCompleted, gcCompleted, conversions };
}
