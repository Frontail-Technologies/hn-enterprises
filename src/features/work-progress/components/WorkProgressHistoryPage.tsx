import { format, parseISO } from "date-fns";
import Link from "next/link";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  workStageDetails,
} from "../services/work-progress.service";
import type { WorkProgressRecord } from "../types/work-progress.types";
import { WorkProgressBreadcrumb } from "./WorkProgressBreadcrumb";

type HistoryRow = {
  id: string;
  dateTime: string;
  stage: string;
  status: string;
  updatedBy: string;
  remarks: string;
  evidence: string;
};

export function WorkProgressHistoryPage({ record }: { record: WorkProgressRecord }) {
  const rows: HistoryRow[] = workStageDetails
    .map((stage, index) => ({
      id: stage.id,
      dateTime: stage.completionDate
        ? `${stage.completionDate} ${index === 0 ? "16:10" : "14:20"}`
        : record.lastUpdated,
      stage: stage.stage,
      status: stage.status,
      updatedBy: stage.updatedBy,
      remarks: stage.remarks,
      evidence: index % 2 === 0 ? "2" : "-",
    }))
    .reverse();

  const columns: ColumnDef<HistoryRow>[] = [
    {
      key: "dateTime",
      header: "Date & Time",
      render: (row) => (
        <span className="font-medium text-muted-foreground">{formatDateTime(row.dateTime)}</span>
      ),
    },
    { key: "stage", header: "Stage" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: "updatedBy", header: "Updated By" },
    {
      key: "remarks",
      header: "Remarks",
      className: "max-w-md",
      render: (row) => <p className="text-sm text-foreground">{row.remarks}</p>,
    },
    {
      key: "evidence",
      header: "Evidence",
      render: (row) => (
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
          {row.evidence}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: () => (
        <Link
          href={`/documents?workProgressId=${record.id}`}
          aria-label="View evidence"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <EyeIcon size={15} />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <WorkProgressBreadcrumb
        items={[
          { label: "Work Progress", href: "/work-progress" },
          { label: record.customerName, href: `/work-progress/${record.id}` },
          { label: "History" },
        ]}
      />

      <section className="rounded-xl border border-border/60 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Stage History</h1>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {record.customerName} ({record.bpTrNumber}) • {record.siteArea}
            </p>
          </div>
          <Link
            href={`/work-progress/${record.id}`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Back
          </Link>
        </div>

        <div className="p-3">
          <DataTable
            data={rows}
            columns={columns}
            variant="striped"
            emptyTitle="No stage history found"
            showSerialNumber={false}
          />
        </div>
      </section>
    </div>
  );
}

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
