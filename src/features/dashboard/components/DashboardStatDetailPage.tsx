"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, DownloadSimpleIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type DashboardStatKey,
  type DashboardStatRow,
  getDashboardStatDefinition,
  getDashboardStatRows,
} from "@/features/dashboard/services/dashboard-stats.service";
import { formatDate } from "@/features/commercial/utils/format";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";

export function DashboardStatDetailPage({
  statKey,
  projectId = "all",
  city = "all",
}: {
  statKey: DashboardStatKey;
  projectId?: string;
  city?: string;
}) {
  const [search, setSearch] = useState("");
  const definition = getDashboardStatDefinition(statKey);
  const { data: customers = [], isLoading } = useCustomersQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });
  const scopedCustomers = useMemo(
    () => customers.filter((customer) => city === "all" || customer.city === city),
    [city, customers],
  );
  const rows = useMemo(() => getDashboardStatRows(statKey, scopedCustomers), [scopedCustomers, statKey]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(query),
    );
  }, [rows, search]);
  const columns = useMemo(() => getColumns(statKey), [statKey]);

  return (
    <PageShell
      title={definition.title}
      subtitle={`${filteredRows.length} of ${rows.length} records`}
      actions={
        <>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeftIcon size={14} />
            Back
          </Link>
          <Button type="button" size="sm">
            <DownloadSimpleIcon size={14} />
            Export Excel
          </Button>
        </>
      }
      contentClassName="space-y-3"
    >
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search BP/TR, customer, site, supervisor..."
        className="h-8 w-96 max-w-full"
      />

      <ExcelDataGrid
        columns={columns}
        rows={filteredRows}
        emptyTitle={isLoading ? "Loading..." : "No matching records found"}
        maxHeightClassName="max-h-[68vh]"
      />
    </PageShell>
  );
}

function getColumns(statKey: DashboardStatKey): ExcelColumn<DashboardStatRow>[] {
  const identityColumns: ExcelColumn<DashboardStatRow>[] = [
    {
      key: "bpTrNo",
      label: "BP / TR No.",
      width: 150,
      sticky: true,
      getValue: (row) => row.bpTrNo,
      render: (row) => (
        <Link
          href={`/customers/${row.customerId}/edit`}
          className="font-semibold text-foreground hover:text-primary"
        >
          {row.bpTrNo}
        </Link>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      width: 190,
      sticky: true,
      getValue: (row) => row.customerName,
      render: (row) => (
        <Link
          href={`/customers/${row.customerId}/edit`}
          className="font-semibold text-foreground hover:text-primary"
        >
          {row.customerName}
        </Link>
      ),
    },
    { key: "mobileNo", label: "Mobile", width: 130, getValue: (row) => row.mobileNo },
    { key: "siteArea", label: "Site / Area", width: 190, getValue: (row) => row.siteArea },
    { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor },
  ];

  const actionColumn: ExcelColumn<DashboardStatRow> = {
    key: "actions",
    label: "Action",
    width: 110,
    getValue: () => "Edit",
    render: (row) => (
      <Link
        href={`/customers/${row.customerId}/edit`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary")}
      >
        <PencilSimpleIcon size={14} />
        Edit
      </Link>
    ),
  };

  if (statKey === "survey-done") {
    return [
      ...identityColumns,
      { key: "surveyId", label: "Survey ID", width: 140, getValue: (row) => row.surveyId },
      { key: "surveyDate", label: "Survey Date", width: 130, getValue: (row) => formatMaybeDate(row.surveyDate) },
      { key: "surveyor", label: "Surveyor", width: 160, getValue: (row) => row.surveyor },
      {
        key: "workableStatus",
        label: "Workable",
        width: 160,
        getValue: (row) => row.workableStatus,
        render: (row) => <StatusBadge status={row.workableStatus} />,
      },
      {
        key: "approvalStatus",
        label: "Approval",
        width: 150,
        getValue: (row) => row.approvalStatus,
        render: (row) => <StatusBadge status={row.approvalStatus} />,
      },
      actionColumn,
    ];
  }

  if (statKey === "gi-done") {
    return [
      ...identityColumns,
      { key: "giDate", label: "GI Date", width: 130, getValue: (row) => formatMaybeDate(row.giDate) },
      { key: "totalGi", label: "Total GI", width: 130, getValue: (row) => row.totalGi },
      { key: "giReportNo", label: "GI Report No.", width: 170, getValue: (row) => row.giReportNo },
      { key: "giBillDone", label: "GI Bill", width: 120, getValue: (row) => row.giBillDone },
      actionColumn,
    ];
  }

  if (statKey === "gc-done") {
    return [
      ...identityColumns,
      { key: "gcReportNo", label: "GC Report No.", width: 170, getValue: (row) => row.gcReportNo },
      {
        key: "gcStatus",
        label: "GC Status",
        width: 140,
        getValue: (row) => row.gcStatus,
        render: (row) => <StatusBadge status={row.gcStatus} />,
      },
      { key: "gcBillDone", label: "GC Bill", width: 120, getValue: (row) => row.gcBillDone },
      actionColumn,
    ];
  }

  if (statKey === "conversion-done") {
    return [
      ...identityColumns,
      { key: "conversionDate", label: "Conversion Date", width: 150, getValue: (row) => formatMaybeDate(row.conversionDate) },
      { key: "meterNo", label: "Meter No.", width: 140, getValue: (row) => row.meterNo },
      { key: "regulatorNo", label: "Regulator No.", width: 150, getValue: (row) => row.regulatorNo },
      { key: "meterReading", label: "Meter Reading", width: 140, getValue: (row) => row.meterReading },
      actionColumn,
    ];
  }

  if (statKey === "jmr-done") {
    return [
      ...identityColumns,
      { key: "giReportNo", label: "JMR / GI Report No.", width: 180, getValue: (row) => row.giReportNo },
      { key: "jmrDone", label: "JMR Done", width: 130, getValue: (row) => row.jmrDone },
      { key: "jmrSubmittedInPbg", label: "Submitted in PBG", width: 160, getValue: (row) => row.jmrSubmittedInPbg },
      actionColumn,
    ];
  }

  if (statKey === "billing-done") {
    return [
      ...identityColumns,
      { key: "giBillDone", label: "GI Bill", width: 120, getValue: (row) => row.giBillDone },
      { key: "gcBillDone", label: "GC Bill", width: 120, getValue: (row) => row.gcBillDone },
      { key: "conversionBillDone", label: "Conversion Bill", width: 150, getValue: (row) => row.conversionBillDone },
      {
        key: "billingStatus",
        label: "Billing Status",
        width: 150,
        getValue: (row) => row.billingStatus,
        render: (row) => <StatusBadge status={row.billingStatus} />,
      },
      actionColumn,
    ];
  }

  if (statKey === "pending-rework") {
    return [
      ...identityColumns,
      { key: "reworkModule", label: "Module", width: 130, getValue: (row) => row.reworkModule },
      { key: "reworkIssue", label: "Issue / Remark", width: 320, getValue: (row) => row.reworkIssue },
      { key: "assignedTo", label: "Assigned To", width: 160, getValue: (row) => row.assignedTo },
      {
        key: "approvalStatus",
        label: "Status",
        width: 150,
        getValue: (row) => row.approvalStatus || row.status,
        render: (row) => <StatusBadge status={row.approvalStatus || row.status} />,
      },
      actionColumn,
    ];
  }

  return [
    ...identityColumns,
    { key: "projectName", label: "Project", width: 230, getValue: (row) => row.projectName },
    { key: "city", label: "City", width: 120, getValue: (row) => row.city },
    { key: "connectionType", label: "Connection Type", width: 150, getValue: (row) => row.connectionType },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    actionColumn,
  ];
}

function formatMaybeDate(value: string) {
  if (!value || value === "-") return "-";
  return formatDate(value);
}
