"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon, NotePencilIcon, WarningIcon } from "@phosphor-icons/react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { useComplaintsQuery } from "../hooks/useComplaints";
import type { Complaint } from "../types/complaint.types";
import { formatDate, uniqOptions } from "../utils/format";
import { ComplaintDrawer } from "./complaints/ComplaintDrawer";
import { ComplaintPriorityBadge } from "./complaints/ComplaintPriorityBadge";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";
import { StatCardRow, SummaryValue } from "./shared/StatCards";
import { TableSection } from "./shared/TableSection";

export function ComplaintsPage() {
  const { data: complaints = [], isLoading } = useComplaintsQuery();
  const { data: customers = [] } = useCustomersQuery();
  const [filters, setFilters] = useState({ search: "", priority: "all", status: "all" });

  const getComplaintCustomer = useMemo(
    () => (complaint: Complaint) => customers.find((customer) => customer.id === complaint.customerId),
    [customers],
  );

  const totals = {
    open: complaints.filter((row) => row.status === "Open").length,
    inProgress: complaints.filter((row) => row.status === "In Progress").length,
    resolved: complaints.filter((row) => row.status === "Resolved" || row.status === "Closed").length,
  };

  const data = useMemo(() => {
    const search = filters.search.toLowerCase();
    return complaints.filter((row) => {
      const customer = getComplaintCustomer(row);
      return (
        (!search ||
          [row.title, customer?.customerConnection.customerName, customer?.siteArea]
            .join(" ")
            .toLowerCase()
            .includes(search)) &&
        (filters.priority === "all" || row.priority === filters.priority) &&
        (filters.status === "all" || row.status === filters.status)
      );
    });
  }, [complaints, filters, getComplaintCustomer]);

  const columns: ColumnDef<Complaint>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (row) => {
        const customer = getComplaintCustomer(row);
        return (
          <div>
            <p className="font-medium text-foreground">
              {customer?.customerConnection.customerName ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground">{customer?.siteArea ?? "-"}</p>
          </div>
        );
      },
    },
    { key: "title", header: "Title" },
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
      className: "w-16",
      render: (row) => (
        <ComplaintDrawer
          complaint={row}
          triggerLabel="Edit Complaint"
          icon={<NotePencilIcon size={15} />}
          iconOnly
        />
      ),
    },
  ];

  const exportColumns: ExportColumn<Complaint>[] = [
    { label: "Customer", getValue: (row) => getComplaintCustomer(row)?.customerConnection.customerName ?? "-" },
    { label: "Site", getValue: (row) => getComplaintCustomer(row)?.siteArea ?? "-" },
    { label: "Title", getValue: (row) => row.title },
    { label: "Priority", getValue: (row) => row.priority },
    { label: "Status", getValue: (row) => row.status },
    { label: "Raised On", getValue: (row) => formatDate(row.createdAt) },
    { label: "Remarks", getValue: (row) => row.supervisorRemark },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Complaints"
        subtitle="Raise and track complaints against customers."
        actions={
          <>
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "default" })}
              onClick={() => void exportRowsToExcel("complaints.xlsx", exportColumns, data)}
            >
              <DownloadSimpleIcon size={15} />
              Export Excel
            </button>
            <ComplaintDrawer triggerLabel="Raise Complaint" />
          </>
        }
      />
      <StatCardRow>
        <SummaryValue label="Open" value={String(totals.open)} icon={<WarningIcon size={17} />} warn />
        <SummaryValue label="In Progress" value={String(totals.inProgress)} />
        <SummaryValue label="Resolved / Closed" value={String(totals.resolved)} />
      </StatCardRow>
      <TableSection>
        <FilterSheetButton
          searchKey="search"
          searchPlaceholder="Search complaint or customer..."
          title="Complaint Filters"
          values={filters}
          filters={[
            {
              key: "priority",
              placeholder: "All Priorities",
              options: uniqOptions(complaints.map((row) => row.priority)),
            },
            {
              key: "status",
              placeholder: "All Statuses",
              options: uniqOptions(complaints.map((row) => row.status)),
            },
          ]}
          onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
          onReset={() => setFilters({ search: "", priority: "all", status: "all" })}
        />
        <PaginatedDataTable data={data} columns={columns} isLoading={isLoading} />
      </TableSection>
    </div>
  );
}
