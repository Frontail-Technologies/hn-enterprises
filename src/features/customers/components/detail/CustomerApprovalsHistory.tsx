"use client";

import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCustomerApprovalsHistory, type CustomerApprovalRow } from "../../hooks/useCustomerApprovalsHistory";
import { formatDateTime } from "../../utils/format";
import type { Customer } from "../../types/customer.types";

const columns: ColumnDef<CustomerApprovalRow>[] = [
  { key: "reference", header: "Reference", className: "font-medium" },
  { key: "module", header: "Module" },
  { key: "submittedBy", header: "Submitted By" },
  { key: "date", header: "Date", render: (row) => formatDateTime(row.date) },
  { key: "remarks", header: "Remarks", className: "min-w-64" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

/**
 * Presentational-only approvals/activity history (§12 of the Checkpoint B
 * brief). All multi-source row building/normalization lives in
 * `useCustomerApprovalsHistory`; this component just renders the result.
 */
export function CustomerApprovalsHistory({ customer }: { customer: Customer }) {
  const { approvalRows, workProgressUpdates } = useCustomerApprovalsHistory(customer);

  return (
    <div className="space-y-4">
      <SectionCard title="Approvals">
        <DataTable columns={columns} data={approvalRows} variant="striped" />
      </SectionCard>

      <SectionCard title="Activity History">
        {workProgressUpdates.length ? (
          <div className="relative space-y-3 before:absolute before:left-2.5 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {workProgressUpdates.map((update) => (
              <div key={update.id} className="relative flex gap-3">
                <span className="mt-1 h-5 w-5 rounded-full border-4 border-background bg-primary" />
                <div className="rounded-lg bg-muted/20 px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    {update.stage} — {update.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {update.remarks || update.nextRequiredAction || "-"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {update.supervisor?.name ?? "-"} - {formatDateTime(update.createdAt)} - {update.stage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No work progress updates recorded yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
