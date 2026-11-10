"use client";

import { NotePencilIcon } from "@phosphor-icons/react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ComplaintDialog } from "@/features/complaints/components/complaints/ComplaintDialog";
import { ComplaintPriorityBadge } from "@/features/complaints/components/complaints/ComplaintPriorityBadge";
import { useComplaintsQuery, useDeleteComplaint } from "@/features/complaints/hooks/useComplaints";
import type { Complaint } from "@/features/complaints/types/complaint.types";
import { formatDate } from "@/features/complaints/utils/format";

const columns: ListColumn<Complaint>[] = [
  { id: "title", header: "Title", value: (row) => row.title, isTitle: true, hideable: false, sortable: true, width: 300, grow: true },
  { id: "priority", header: "Priority", width: 120, sortable: true, value: (row) => row.priority, cell: (row) => <ComplaintPriorityBadge priority={row.priority} /> },
  { id: "status", header: "Status", width: 130, sortable: true, value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
  { id: "createdAt", header: "Raised on", width: 130, sortable: true, value: (row) => row.createdAt, cell: (row) => formatDate(row.createdAt) },
];

// Search matched the title only before migration; keep that.
const searchText = (row: Complaint) => row.title;

export function CustomerComplaintsPanel({ customerId }: { customerId: string }) {
  const { data: complaints = [], isLoading, isError, refetch } = useComplaintsQuery({ customerId });
  const deleteComplaint = useDeleteComplaint();
  const list = useListState({ pageSize: 25, storageKey: "customer-complaints" });
  const { pageRows, total } = useClientRows(complaints, list, { columns, searchText });

  return (
    <section className="space-y-3">
      <h2 className="text-section-title">Complaints</h2>
      <ListTable
        itemLabel="complaint"
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        searchPlaceholder="Search complaints..."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        actions={<ComplaintDialog preselectedCustomerId={customerId} triggerLabel="Raise Complaint" />}
        empty={{ illustration: "allClear", title: "No complaints for this customer", description: "Complaints raised for this customer will appear here." }}
        rowActionsWidth={80}
        renderRowActions={(row) => (
          <div className="flex items-center gap-0.5">
            <ComplaintDialog complaint={row} preselectedCustomerId={customerId} triggerLabel="Edit Complaint" icon={<NotePencilIcon size={15} />} iconOnly />
            <DeleteConfirmDialog itemName={row.title} onConfirm={() => deleteComplaint.mutateAsync(row.id)} />
          </div>
        )}
      />
    </section>
  );
}
