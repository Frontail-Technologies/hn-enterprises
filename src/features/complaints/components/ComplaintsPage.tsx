"use client";

import { useState } from "react";
import Link from "next/link";
import { NotePencilIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ListTable, useClientRows, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useComplaintsQuery, useDeleteComplaint, usePushComplaintNotification } from "../hooks/useComplaints";
import type { Complaint, ComplaintStatus } from "../types/complaint.types";
import { formatDate, uniqOptions } from "../utils/format";
import { ComplaintDialog } from "./complaints/ComplaintDialog";
import { ComplaintPriorityBadge } from "./complaints/ComplaintPriorityBadge";

const complaintStatuses: ComplaintStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

const filters: ListFilter[] = [{ id: "status", label: "Status", quick: true, options: uniqOptions(complaintStatuses) }];

const columns: ListColumn<Complaint>[] = [
  { id: "title", header: "Title", value: (row) => row.title, isTitle: true, hideable: false, sortable: true, width: 300, grow: true },
  {
    id: "customer",
    header: "Customer",
    width: 240,
    value: (row) => row.customer?.name || row.customer?.trBpNumber,
    sortable: true,
    cell: (row) => {
      const name = row.customer?.name;
      const trBpNumber = row.customer?.trBpNumber;
      if (!name && !trBpNumber) return <span className="text-muted-foreground">—</span>;
      return (
        <Link href={`/customers/${row.customerId}`} className="hover:text-primary hover:underline">
          <span className="font-medium text-foreground">{name || `BR/TR: ${trBpNumber}`}</span>
          {name && trBpNumber ? <span className="text-muted-foreground"> · {trBpNumber}</span> : null}
        </Link>
      );
    },
  },
  { id: "priority", header: "Priority", width: 120, value: (row) => row.priority, sortable: true, cell: (row) => <ComplaintPriorityBadge priority={row.priority} /> },
  { id: "status", header: "Status", width: 130, value: (row) => row.status, sortable: true, cell: (row) => <StatusBadge status={row.status} /> },
  { id: "createdAt", header: "Raised on", width: 130, value: (row) => row.createdAt, sortable: true, cell: (row) => formatDate(row.createdAt) },
];

const searchText = (row: Complaint) => [row.title, row.customer?.name, row.customer?.trBpNumber].filter(Boolean).join(" ");

export function ComplaintsPage() {
  const list = useListState({ pageSize: 50, storageKey: "complaints" });
  const status = list.filters.status as ComplaintStatus | undefined;
  // Status is filtered by the API (as before); search, sort and paging run on the loaded rows.
  const { data: complaints = [], isLoading, isError, refetch } = useComplaintsQuery(status ? { status } : {});
  const { pageRows, total } = useClientRows(complaints, list, { columns, searchText });

  const deleteComplaint = useDeleteComplaint();
  const pushComplaint = usePushComplaintNotification();
  const [pushingId, setPushingId] = useState<string | null>(null);

  return (
    <PageShell title="Complaints" description="Customer complaints and their resolution status." actions={<ComplaintDialog triggerLabel="New Complaint" />}>
      <ListTable
        itemLabel="complaint"
        rows={pageRows}
        total={total}
        columns={columns}
        state={list}
        filters={filters}
        searchPlaceholder="Search complaint or customer..."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        enableFullView
        empty={{ illustration: "allClear", title: "No complaints", description: "Complaints raised for customers will appear here." }}
        rowActionsWidth={112}
        renderRowActions={(row) => (
          <div className="flex items-center gap-0.5">
            <ActionTooltip label="Push notification">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Push notification"
                className="text-muted-foreground hover:text-foreground"
                disabled={pushingId === row.id}
                onClick={() => {
                  setPushingId(row.id);
                  pushComplaint.mutate(row.id, { onSettled: () => setPushingId(null) });
                }}
              >
                <PaperPlaneTiltIcon size={15} />
              </Button>
            </ActionTooltip>
            <ComplaintDialog complaint={row} preselectedCustomerId={row.customerId} triggerLabel="Edit Complaint" icon={<NotePencilIcon size={15} />} iconOnly />
            <DeleteConfirmDialog itemName={row.title} onConfirm={() => deleteComplaint.mutateAsync(row.id)} />
          </div>
        )}
      />
    </PageShell>
  );
}
