"use client";

import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCustomerApprovalsHistory, type CustomerApprovalRow } from "../../hooks/useCustomerApprovalsHistory";
import { formatDateTime } from "../../utils/format";
import type { Customer } from "../../types/customer.types";

const columns: ListColumn<CustomerApprovalRow>[] = [
  { id: "reference", header: "Reference", value: (row) => row.reference, isTitle: true, hideable: false, sortable: true, width: 180 },
  { id: "module", header: "Module", value: (row) => row.module, sortable: true, width: 150 },
  { id: "submittedBy", header: "Submitted by", value: (row) => row.submittedBy, sortable: true, width: 160 },
  { id: "date", header: "Date", value: (row) => row.date, sortable: true, width: 170, cell: (row) => formatDateTime(row.date) },
  { id: "remarks", header: "Remarks", value: (row) => row.remarks, width: 260, grow: true },
  { id: "status", header: "Status", value: (row) => row.status, sortable: true, width: 130, cell: (row) => <StatusBadge status={row.status} /> },
];

/**
 * Presentational-only approvals/activity history (§12 of the Checkpoint B
 * brief). All multi-source row building/normalization lives in
 * `useCustomerApprovalsHistory`; this component just renders the result.
 */
export function CustomerApprovalsHistory({ customer }: { customer: Customer }) {
  const { approvalRows, workProgressUpdates } = useCustomerApprovalsHistory(customer);
  const list = useListState({ pageSize: 25, storageKey: "customer-approvals" });
  const { pageRows, total } = useClientRows(approvalRows, list, { columns });

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        <h2 className="text-section-title">Approvals</h2>
        <ListTable
          itemLabel="approval"
          rows={pageRows}
          total={total}
          columns={columns}
          state={list}
          searchable={false}
          empty={{ illustration: "checklist", title: "No approvals yet", description: "Survey, installation and other approvals for this customer will appear here." }}
        />
      </section>

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
