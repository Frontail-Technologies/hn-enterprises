"use client";

import { SectionCompletionActions } from "./SectionCompletionActions";
import { formatDateTime } from "../../utils/format";
import type {
  CompletionSectionKey,
  CustomerCompletionAudit,
  CustomerSectionCompletion,
} from "../../types/customer.types";

type Milestone = {
  key: CompletionSectionKey;
  label: string;
  completedOnKey: keyof CustomerCompletionAudit;
  completedByKey: keyof CustomerCompletionAudit;
};

/**
 * The seven customer progress milestones (§11 of the Checkpoint B brief).
 * The UI contract for every milestone row is genuinely uniform - a label,
 * a completion pill/action, and an optional "completed on/by" caption - so
 * this is a data-driven `milestones` config feeding one presentational row,
 * rather than the seven near-identical `ProgressMilestoneRow` call sites
 * that used to sit inline in `CustomerDetail`. The milestones themselves
 * keep their own distinct section keys / audit fields, so nothing about
 * their individual business semantics is hidden.
 */
const milestones: Milestone[] = [
  { key: "gc", label: "GC Done", completedOnKey: "gcCompletedOn", completedByKey: "gcCompletedBy" },
  { key: "valveChamber", label: "Valve Chamber", completedOnKey: "valveChamberCompletedOn", completedByKey: "valveChamberCompletedBy" },
  { key: "poleMarker", label: "Pole Marker", completedOnKey: "poleMarkerCompletedOn", completedByKey: "poleMarkerCompletedBy" },
  { key: "routeMarker", label: "Route Marker", completedOnKey: "routeMarkerCompletedOn", completedByKey: "routeMarkerCompletedBy" },
  { key: "preCommissioning", label: "Pre Commissioning", completedOnKey: "preCommissioningCompletedOn", completedByKey: "preCommissioningCompletedBy" },
  { key: "connection", label: "Connection Done", completedOnKey: "connectionCompletedOn", completedByKey: "connectionCompletedBy" },
  { key: "siteExpenses", label: "Site Expenses Done", completedOnKey: "siteExpensesCompletedOn", completedByKey: "siteExpensesCompletedBy" },
];

export function CustomerProgressMilestones({
  customerId,
  completion,
  audit,
}: {
  customerId: string;
  completion?: CustomerSectionCompletion;
  audit?: CustomerCompletionAudit;
}) {
  return (
    <div className="divide-y divide-border/60">
      {milestones.map((milestone) => {
        const result = completion?.[milestone.key];
        const isDone = result?.status === "DONE";
        const completedOn = audit?.[milestone.completedOnKey] ?? null;
        const completedBy = audit?.[milestone.completedByKey] ?? null;

        return (
          <div key={milestone.key} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{milestone.label}</p>
              {isDone && (completedOn || completedBy) ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {completedOn ? `Completed on ${formatDateTime(completedOn)}` : null}
                  {completedOn && completedBy ? " · " : null}
                  {completedBy ? `by ${completedBy}` : null}
                </p>
              ) : null}
            </div>
            <SectionCompletionActions
              customerId={customerId}
              sectionKey={milestone.key}
              sectionLabel={milestone.label}
              result={result}
            />
          </div>
        );
      })}
    </div>
  );
}
