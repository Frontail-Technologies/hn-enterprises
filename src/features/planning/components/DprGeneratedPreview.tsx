"use client";

import { format, parseISO } from "date-fns";
import { PrinterIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { DprTask } from "../types/planning.types";

export function DprGeneratedPreview({
  date,
  siteAddress,
  tasks,
  remarks,
}: {
  date: string;
  siteAddress: string;
  tasks: DprTask[];
  remarks: string;
}) {
  const formattedDate = date ? format(parseISO(date), "dd.MM.yyyy") : "-";

  return (
    <div className="space-y-3">
      <div className="flex justify-end print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <PrinterIcon size={15} />
          Print
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card p-4 print:border-black print:p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm print:text-xs">
            <tbody>
              <tr>
                <td className="border border-border px-2 py-1 text-center font-semibold" colSpan={4}>
                  DPR/PLANNING
                </td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1 font-medium">DATE</td>
                <td className="border border-border px-2 py-1">{formattedDate}</td>
                <td className="border border-border px-2 py-1 font-medium">ADDRESS</td>
                <td className="border border-border px-2 py-1">{siteAddress}</td>
              </tr>
              <tr className="font-semibold">
                <td className="w-2/5 border border-border px-2 py-1">TASK</td>
                <td className="w-24 border border-border px-2 py-1 text-center">QTY</td>
                <td className="w-48 border border-border px-2 py-1">PLUMBER/LABOURE</td>
                <td className="border border-border px-2 py-1">REMARKS</td>
              </tr>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="border border-border px-2 py-1">{task.label}</td>
                  <td className="border border-border px-2 py-1 text-center">
                    {task.completedQty || "-"}
                  </td>
                  <td className="border border-border px-2 py-1">{task.worker || "-"}</td>
                  <td className="border border-border px-2 py-1">{task.delayReason || "-"}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-border px-2 py-1 font-medium">Supervisor Remarks</td>
                <td className="border border-border px-2 py-1" colSpan={3}>
                  {remarks || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
