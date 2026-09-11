import type { DprTask, PlanTask } from "../types/planning.types";

export function taskSummary(tasks: PlanTask[]) {
  return tasks
    .filter((task) => task.qty.trim())
    .map((task) => `${task.label} (${task.qty})`)
    .join(", ");
}

export function dprWorkSummary(tasks: DprTask[]) {
  return tasks
    .filter((task) => task.completedQty.trim())
    .map((task) => `${task.label} (${task.completedQty})`)
    .join(", ");
}

export function customerLabel(name: string, trBpNo: string) {
  return trBpNo ? `${trBpNo} — ${name}` : name || "—";
}
