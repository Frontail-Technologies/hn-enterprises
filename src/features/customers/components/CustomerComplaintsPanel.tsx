"use client";

import { useMemo, useState } from "react";
import { NotePencilIcon, WarningIcon } from "@phosphor-icons/react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useComplaintsQuery } from "@/features/complaints/hooks/useComplaints";
import type { Complaint } from "@/features/complaints/types/complaint.types";
import { formatDate } from "@/features/complaints/utils/format";
import { ComplaintDrawer } from "@/features/complaints/components/complaints/ComplaintDrawer";
import { ComplaintPriorityBadge } from "@/features/complaints/components/complaints/ComplaintPriorityBadge";
import { PaginatedDataTable } from "@/features/complaints/components/shared/PaginatedDataTable";
import { SectionCard } from "@/components/shared/SectionCard";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useDeleteComplaint } from "@/features/complaints/hooks/useComplaints";

export function CustomerComplaintsPanel({ customerId }: { customerId: string }) {
  const { data: allComplaints = [], isLoading } = useComplaintsQuery();
  const deleteComplaint = useDeleteComplaint();
  const [search, setSearch] = useState("");

  const complaints = useMemo(() => {
    return allComplaints.filter((c: Complaint) => c.customerId === customerId);
  }, [allComplaints, customerId]);

  const data = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return complaints;
    return complaints.filter((row: Complaint) => row.title.toLowerCase().includes(s));
  }, [complaints, search]);

  const columns: ColumnDef<Complaint>[] = [
    { key: "title", header: "Title", className: "w-[40%]" },
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
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <ComplaintDrawer
            complaint={row}
            preselectedCustomerId={customerId}
            triggerLabel="Edit Complaint"
            icon={<NotePencilIcon size={15} />}
            iconOnly
          />
          <DeleteConfirmDialog
            itemName={row.title}
            onConfirm={() => deleteComplaint.mutateAsync(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <SectionCard title="Complaints">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[300px]"
        />
        <ComplaintDrawer
          preselectedCustomerId={customerId}
          triggerLabel="Raise Complaint"
        />
      </div>

      <PaginatedDataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
      />
    </SectionCard>
  );
}
