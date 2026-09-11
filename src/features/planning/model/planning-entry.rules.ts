import type { DprRecord, PlanningEntryRow, SitePlan } from "../types/planning.types";

export type SupervisorGroupStatus = "Done" | "Partial" | "Pending";

export type SupervisorGroup = {
  supervisorId: string;
  supervisorName: string;
  rows: PlanningEntryRow[];
  planned: number;
  dprDone: number;
  pending: number;
  status: SupervisorGroupStatus;
};

export type PlanningEntrySummary = {
  plannedWork: number;
  dprSubmitted: number;
  pending: number;
  supervisorsCount: number;
};

export const DPR_DONE_STATUSES = new Set(["Submitted", "Approved"]);

export function isDprDone(status: PlanningEntryRow["dprStatus"]) {
  return DPR_DONE_STATUSES.has(status);
}

export function buildPlanningEntryRows(sitePlans: SitePlan[], dprRecords: DprRecord[]): PlanningEntryRow[] {
  const map = new Map<string, PlanningEntryRow>();

  sitePlans.forEach((plan) => {
    map.set(`${plan.supervisorId}-${plan.customerId}`, {
      supervisorId: plan.supervisorId,
      supervisorName: plan.supervisorName,
      customerId: plan.customerId,
      customerName: plan.customerName,
      customerTrBpNo: plan.customerTrBpNo,
      projectId: plan.projectId,
      siteId: plan.siteId,
      siteArea: plan.siteLabel,
      planFiled: true,
      planTasks: plan.tasks,
      dprStatus: "Not Filed",
      dprRemarks: "",
    });
  });

  dprRecords.forEach((record) => {
    const key = `${record.supervisorId}-${record.customerId}`;
    const existing = map.get(key);
    if (existing) {
      existing.dprStatus = record.status;
      existing.dprRemarks = record.remarks;
    } else {
      map.set(key, {
        supervisorId: record.supervisorId,
        supervisorName: record.supervisorName,
        customerId: record.customerId,
        customerName: record.customerName,
        customerTrBpNo: record.customerTrBpNo,
        projectId: record.projectId,
        siteId: record.siteId,
        siteArea: record.siteLabel,
        planFiled: false,
        planTasks: [],
        dprStatus: record.status,
        dprRemarks: record.remarks,
      });
    }
  });

  return Array.from(map.values());
}

export function buildPlanningSummary(rows: PlanningEntryRow[]): PlanningEntrySummary {
  const plannedWork = rows.filter((row) => row.planFiled).length;
  const dprSubmitted = rows.filter((row) => isDprDone(row.dprStatus)).length;
  const pending = rows.filter((row) => row.planFiled && !isDprDone(row.dprStatus)).length;
  const supervisorsCount = new Set(rows.map((row) => row.supervisorId)).size;
  return { plannedWork, dprSubmitted, pending, supervisorsCount };
}

export function buildSupervisorGroups(rows: PlanningEntryRow[]): SupervisorGroup[] {
  const groups = new Map<string, PlanningEntryRow[]>();
  rows.forEach((row) => {
    const current = groups.get(row.supervisorId) ?? [];
    current.push(row);
    groups.set(row.supervisorId, current);
  });

  return Array.from(groups.entries()).map(([id, group]) => {
    const planned = group.filter((row) => row.planFiled);
    const doneAmongPlanned = planned.filter((row) => isDprDone(row.dprStatus)).length;
    const pendingCount = planned.length - doneAmongPlanned;

    let status: SupervisorGroupStatus;
    if (planned.length === 0) {
      const doneAny = group.filter((row) => isDprDone(row.dprStatus)).length;
      status = doneAny === group.length ? "Done" : doneAny > 0 ? "Partial" : "Pending";
    } else if (pendingCount === 0) {
      status = "Done";
    } else if (doneAmongPlanned > 0) {
      status = "Partial";
    } else {
      status = "Pending";
    }

    return {
      supervisorId: id,
      supervisorName: group[0]?.supervisorName ?? "",
      rows: group,
      planned: planned.length,
      dprDone: doneAmongPlanned,
      pending: pendingCount,
      status,
    };
  });
}

export function buildDprByKey(dprRecords: DprRecord[]): Map<string, DprRecord> {
  const map = new Map<string, DprRecord>();
  dprRecords.forEach((record) => map.set(`${record.supervisorId}-${record.customerId}`, record));
  return map;
}

export function buildPlanByKey(sitePlans: SitePlan[]): Map<string, SitePlan> {
  const map = new Map<string, SitePlan>();
  sitePlans.forEach((plan) => map.set(`${plan.supervisorId}-${plan.customerId}`, plan));
  return map;
}
