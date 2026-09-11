"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, NotePencilIcon, PaperPlaneTiltIcon, WarningIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ColumnDef } from "@/components/shared/DataTable";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { FilterDialog } from "@/components/shared/FilterDialog";
import { PageShell } from "@/components/shared/PageShell";
import { PaginatedDataTable } from "@/components/shared/PaginatedDataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useComplaintsQuery, useDeleteComplaint, usePushComplaintNotification } from "../hooks/useComplaints";
import type { Complaint, ComplaintStatus } from "../types/complaint.types";
import { formatDate, uniqOptions } from "../utils/format";
import { ComplaintDialog } from "./complaints/ComplaintDialog";
import { ComplaintPriorityBadge } from "./complaints/ComplaintPriorityBadge";

const complaintStatuses: ComplaintStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

export function ComplaintsPage() {
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const { data: complaints = [], isLoading } = useComplaintsQuery(
    filters.status === "all" ? {} : { status: filters.status as ComplaintStatus },
  );
  const deleteComplaint = useDeleteComplaint();
  const pushComplaint = usePushComplaintNotification();
  const [pushingId, setPushingId] = useState<string | null>(null);

  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    if (!search) return complaints;
    return complaints.filter((row) => {
      const haystack = [row.title, row.customer?.name, row.customer?.trBpNumber].filter(Boolean).join(" ");
      return haystack.toLowerCase().includes(search);
    });
  }, [complaints, filters.search]);

  const columns: ColumnDef<Complaint>[] = [
    { key: "title", header: "Title", className: "w-[28%]" },
    {
      key: "customer",
      header: "Customer",
      render: (row) => {
        const name = row.customer?.name;
        const trBpNumber = row.customer?.trBpNumber;
        if (!name && !trBpNumber) return <span className="text-muted-foreground">-</span>;
        return (
          <Link href={`/customers/${row.customerId}`} className="flex flex-col hover:text-primary">
            <span className="font-medium text-foreground">{name || `BR/TR: ${trBpNumber}`}</span>
            {name && trBpNumber ? <span className="text-xs text-muted-foreground">{trBpNumber}</span> : null}
          </Link>
        );
      },
    },
    {
      key: "priority",
      header: "Priority",
      render: (row) => <ComplaintPriorityBadge priority={row.priority} />,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Raised On",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32",
      render: (row) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="Push notification">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Push notification"
              disabled={pushingId === row.id}
              onClick={() => {
                setPushingId(row.id);
                pushComplaint.mutate(row.id, { onSettled: () => setPushingId(null) });
              }}
            >
              <PaperPlaneTiltIcon size={15} />
            </Button>
          </ActionTooltip>
          <ComplaintDialog
            complaint={row}
            preselectedCustomerId={row.customerId}
            triggerLabel="Edit Complaint"
            icon={<NotePencilIcon size={15} />}
            iconOnly
          />
          <DeleteConfirmDialog itemName={row.title} onConfirm={() => deleteComplaint.mutateAsync(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Complaints"
      icon={WarningIcon}
      actions={
        <>
          <div className="relative min-w-0 sm:w-64">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
            <Input
              placeholder="Search complaint or customer..."
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="h-8 w-full max-w-full pl-8 sm:w-64"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:contents">
            <FilterDialog
              title="Complaint Filters"
              values={filters}
              filters={[
                {
                  key: "status",
                  placeholder: "All Statuses",
                  options: uniqOptions(complaintStatuses),
                },
              ]}
              onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
              onReset={() => setFilters((current) => ({ ...current, status: "all" }))}
            />

            <ComplaintDialog triggerLabel="New Complaint" />
          </div>
        </>
      }
      contentClassName="space-y-3"
    >
      <PaginatedDataTable data={data} columns={columns} isLoading={isLoading} enableFullView />
    </PageShell>
  );
}
