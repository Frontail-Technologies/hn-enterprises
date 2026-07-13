"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CheckCircleIcon, EyeIcon, SealWarningIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CountTabs } from "@/components/shared/CountTabs";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageShell } from "@/components/shared/PageShell";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePanel } from "@/components/shared/TablePanel";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  approvalHistory,
  approvalModuleOptions,
  approvalRecords,
  type ApprovalDecision,
  type ApprovalRecord,
} from "../services/approvals.service";

const initialFilters = {
  search: "",
  module: "all",
};

export function ApprovalsPage() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return approvalRecords.filter((record) => {
      const matchesSearch =
        !search ||
        record.referenceNo.toLowerCase().includes(search) ||
        record.title.toLowerCase().includes(search) ||
        record.submittedBy.toLowerCase().includes(search);
      const matchesModule = filters.module === "all" || record.module === filters.module;
      return matchesSearch && matchesModule;
    });
  }, [filters]);

  const pagination = usePagination({ items: filteredRecords, pageSize: 8 });

  const columns: ColumnDef<ApprovalRecord>[] = [
    {
      key: "record",
      header: "Record",
      render: (record) => (
        <div>
          <p className="font-semibold text-foreground">{record.referenceNo}</p>
          <p className="text-xs font-medium text-muted-foreground">{record.title}</p>
        </div>
      ),
    },
    { key: "module", header: "Module" },
    { key: "submittedBy", header: "Submitted By" },
    {
      key: "submittedOn",
      header: "Submitted On",
      render: (record) => formatDateTime(record.submittedOn),
    },
    {
      key: "priority",
      header: "Priority",
      render: (record) => (
        <span className={record.priority === "High" ? "font-semibold text-primary" : "font-medium text-muted-foreground"}>
          {record.priority}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: (record) => <ReviewSheet record={record} />,
    },
  ];

  return (
    <PageShell
      title="Approvals"
      subtitle="Review submitted records and approve, send back or reject with remarks."
    >
      <CountTabs
        items={[
          { label: "Pending Queue", value: approvalRecords.length, active: true },
          {
            label: "High Priority",
            value: approvalRecords.filter((record) => record.priority === "High").length,
          },
          { label: "History Items", value: approvalHistory.length },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <TablePanel
          title="Pending Approvals"
          subtitle="Decision queue by module and submitted reference."
          toolbar={
            <FilterSheetButton
              searchKey="search"
              searchPlaceholder="Search reference, title or submitter..."
              values={filters}
              filters={[{ key: "module", placeholder: "All Modules", options: approvalModuleOptions }]}
              onChange={(key, value) => {
                setFilters((current) => ({ ...current, [key]: value }));
                pagination.setPage(1);
              }}
              onReset={() => {
                setFilters(initialFilters);
                pagination.setPage(1);
              }}
            />
          }
          pagination={
            <Pagination
              compact
              page={pagination.page}
              pageCount={pagination.pageCount}
              totalItems={pagination.totalItems}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              onPageChange={pagination.setPage}
            />
          }
        >
          <DataTable
            data={pagination.paginatedItems}
            columns={columns}
            serialNumberStart={pagination.startItem}
            emptyTitle="No pending approvals"
            stickyHeader
            stickyLastColumn
            containerClassName="rounded-none border-0"
          />
        </TablePanel>

        <aside className="rounded-lg border border-border/70 bg-card p-3">
          <p className="text-sm font-semibold text-foreground">Approval History</p>
          <div className="mt-2 space-y-2">
            {approvalHistory.map((item) => (
              <div key={item.id} className="rounded-md bg-muted/35 px-2.5 py-2">
                <p className="text-sm font-semibold text-foreground">{item.action} - {item.referenceNo}</p>
                <p className="text-xs font-medium text-muted-foreground">{item.actor} - {formatDateTime(item.dateTime)}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{item.remarks}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </PageShell>
  );
}

function ReviewSheet({ record }: { record: ApprovalRecord }) {
  const [decision, setDecision] = useState<ApprovalDecision>("Approve");

  return (
    <Sheet>
      <SheetTrigger
        render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Review approval" title="Review approval" />}
      >
        <EyeIcon size={15} />
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Review Approval</SheetTitle>
          <SheetDescription>{record.referenceNo} - {record.module}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <section className="rounded-lg border border-border/70 bg-background p-3">
            <p className="text-sm font-semibold text-foreground">{record.title}</p>
            <InfoLine label="Submitted By" value={record.submittedBy} />
            <InfoLine label="Submitted On" value={formatDateTime(record.submittedOn)} />
            <InfoLine label="Submission Remarks" value={record.summary} />
          </section>

          <div className="grid grid-cols-3 gap-2">
            {(["Approve", "Send Back", "Reject"] as ApprovalDecision[]).map((item) => (
              <Button
                key={item}
                type="button"
                variant={decision === item ? "default" : "outline"}
                onClick={() => setDecision(item)}
              >
                {item}
              </Button>
            ))}
          </div>

          {decision !== "Approve" ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-start gap-2">
                <SealWarningIcon size={16} className="mt-0.5 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">
                  Remarks are mandatory for Send Back and Reject decisions.
                </p>
              </div>
            </div>
          ) : null}

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Reviewer Remarks {decision === "Approve" ? "(optional)" : "(required)"}
            </span>
            <Textarea className="min-h-32" placeholder="Add review remarks" />
          </label>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <SheetClose render={<Button type="button" />}>
              <CheckCircleIcon size={15} />
              Submit Decision
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mt-1 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      <span className="text-sm font-semibold text-foreground">{value || "-"}</span>
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
