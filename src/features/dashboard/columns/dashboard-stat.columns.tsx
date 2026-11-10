"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ExportColumn } from "@/lib/export-excel";
import {
  type DashboardStatKey,
  type DashboardStatRow,
} from "@/features/dashboard/services/dashboard-stats.service";
import { formatDate } from "@/features/commercial/utils/format";

function formatMaybeDate(value: string) {
  if (!value || value === "-") return "-";
  return formatDate(value);
}

type StatColumn = {
  key: string;
  label: string;
  width?: number;
  sticky?: boolean;
  getValue: (row: DashboardStatRow) => string | number | boolean | null | undefined;
  render?: (row: DashboardStatRow) => ReactNode;
};

/** Table columns. Every column keeps its Excel-style filter (page-local, as before). */
export function getDashboardStatColumns(statKey: DashboardStatKey): ListColumn<DashboardStatRow>[] {
  return getStatColumns(statKey).map((column) => ({
    id: column.key,
    header: column.label,
    width: column.width,
    pin: column.sticky,
    hideable: !column.sticky,
    columnFilter: true,
    value: column.getValue,
    cell: column.render,
  }));
}

/** Excel export columns (same columns as the table, without the Edit action). */
export function getDashboardStatExportColumns(statKey: DashboardStatKey): ExportColumn<DashboardStatRow>[] {
  return getStatColumns(statKey).map((column) => ({ label: column.label, getValue: column.getValue }));
}

function getStatColumns(statKey: DashboardStatKey): StatColumn[] {
  const identityColumns: StatColumn[] = [
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
    { key: "siteArea", label: "Site", width: 160, getValue: (row) => row.siteArea },
    { key: "address", label: "Address", width: 220, getValue: (row) => row.address },
    { key: "mobileNo", label: "Phone", width: 130, getValue: (row) => row.mobileNo },
  ];


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
    ];
  }

  if (statKey === "gi-done") {
    return [
      ...identityColumns,
      { key: "giDate", label: "GI Date", width: 130, getValue: (row) => formatMaybeDate(row.giDate) },
      { key: "totalGi", label: "Total GI", width: 130, getValue: (row) => row.totalGi },
      { key: "giReportNo", label: "GI Report No.", width: 170, getValue: (row) => row.giReportNo },
      { key: "giBillDone", label: "GI Bill", width: 120, getValue: (row) => row.giBillDone },
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
    ];
  }

  if (statKey === "conversion-done") {
    return [
      ...identityColumns,
      { key: "conversionDate", label: "Conversion Date", width: 150, getValue: (row) => formatMaybeDate(row.conversionDate) },
      { key: "meterNo", label: "Meter No.", width: 140, getValue: (row) => row.meterNo },
      { key: "regulatorNo", label: "Regulator No.", width: 150, getValue: (row) => row.regulatorNo },
      { key: "meterReading", label: "Meter Reading", width: 140, getValue: (row) => row.meterReading },
    ];
  }

  if (statKey === "jmr-done") {
    return [
      ...identityColumns,
      { key: "giReportNo", label: "JMR / GI Report No.", width: 180, getValue: (row) => row.giReportNo },
      { key: "jmrDone", label: "JMR Done", width: 130, getValue: (row) => row.jmrDone },
      { key: "jmrSubmittedInPbg", label: "Submitted in PBG", width: 160, getValue: (row) => row.jmrSubmittedInPbg },
    ];
  }

  if (statKey === "gi-bill-done" || statKey === "gc-bill-done" || statKey === "conversion-bill-done") {
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
    ];
  }

  if (statKey === "connection-remark") {
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
    ];
  }

  if (statKey === "commissioning") {
    return [
      ...identityColumns,
      { key: "commissioningDate", label: "Commissioning Date", width: 170, getValue: (row) => formatMaybeDate(row.commissioningDate) },
      { key: "meterNo", label: "Meter No.", width: 140, getValue: (row) => row.meterNo },
    ];
  }

  if (statKey === "valve-chamber-done") {
    return [
      ...identityColumns,
      { key: "valveChamberCompletedOn", label: "Completed On", width: 160, getValue: (row) => formatMaybeDate(row.valveChamberCompletedOn) },
    ];
  }

  if (statKey === "pre-commissioning-done") {
    return [
      ...identityColumns,
      { key: "preCommissioningCompletedOn", label: "Completed On", width: 160, getValue: (row) => formatMaybeDate(row.preCommissioningCompletedOn) },
    ];
  }

  if (statKey === "pole-marker-done") {
    return [
      ...identityColumns,
      { key: "poleMarkerCompletedOn", label: "Completed On", width: 160, getValue: (row) => formatMaybeDate(row.poleMarkerCompletedOn) },
    ];
  }

  if (statKey === "route-marker-done") {
    return [
      ...identityColumns,
      { key: "routeMarkerCompletedOn", label: "Completed On", width: 160, getValue: (row) => formatMaybeDate(row.routeMarkerCompletedOn) },
    ];
  }

  if (statKey === "connection-done") {
    return [
      ...identityColumns,
      { key: "connectionCompletedOn", label: "Connection Completed On", width: 190, getValue: (row) => formatMaybeDate(row.connectionCompletedOn) },
      { key: "meterNo", label: "Meter No.", width: 140, getValue: (row) => row.meterNo },
    ];
  }

  if (statKey === "site-expenses-done") {
    return [
      ...identityColumns,
      { key: "siteExpensesCompletedOn", label: "Completed On", width: 160, getValue: (row) => formatMaybeDate(row.siteExpensesCompletedOn) },
    ];
  }

  if (statKey === "laying-done") {
    return [
      ...identityColumns,
      { key: "layingDate", label: "Laying Date", width: 150, getValue: (row) => formatMaybeDate(row.layingDate) },
      { key: "pipeSummary", label: "Pipe Summary", width: 220, getValue: (row) => row.pipeSummary },
    ];
  }

  if (statKey === "flushing-testing-done") {
    return [
      ...identityColumns,
      { key: "testingDate", label: "Testing Date", width: 150, getValue: (row) => formatMaybeDate(row.testingDate) },
      { key: "purgingDate", label: "Purging Date", width: 150, getValue: (row) => formatMaybeDate(row.purgingDate) },
    ];
  }

  if (statKey === "complaint-customer") {
    return [
      ...identityColumns,
      {
        key: "complaintStatus",
        label: "Complaint Status",
        width: 160,
        getValue: (row) => row.complaintStatus,
        render: (row) => <StatusBadge status={row.complaintStatus} />,
      },
      { key: "complaintDate", label: "Complaint Date", width: 150, getValue: (row) => formatMaybeDate(row.complaintDate) },
    ];
  }

  if (statKey === "customer-resolved") {
    return [
      ...identityColumns,
      { key: "resolvedDate", label: "Resolved Date", width: 150, getValue: (row) => formatMaybeDate(row.resolvedDate) },
      { key: "resolutionRemark", label: "Resolution Remark", width: 260, getValue: (row) => row.resolutionRemark },
    ];
  }

  if (statKey === "total-connection-remark") {
    return [
      ...identityColumns,
      { key: "connectionRemark", label: "Connection Remark", width: 300, getValue: (row) => row.connectionRemark },
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
  ];
}
