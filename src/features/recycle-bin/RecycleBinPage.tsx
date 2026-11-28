"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowCounterClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ListTable, useClientRows, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { customersKey } from "@/features/customers/queries/customer.query-keys";
import { recycleBinApi, type RecycleBinItem } from "./recycle-bin.api";

const binKey = ["recycle-bin"] as const;

/** Lists to refresh after a restore (whatever kind of item came back). */
const RESTORED_KEYS = [
  customersKey,
  ["projects"],
  ["materials"],
  ["plumbers"],
  ["staff"],
  ["bills"],
  ["billing"],
  ["payments"],
  ["expensesByCategory"],
  ["site-plans"],
  ["dpr-records"],
  ["work-progress"],
  ["dashboard"],
  ["dashboard-stats"],
] as const;

const RELATED_LABELS: Record<string, string> = {
  complaints: "complaint",
  customer_documents: "customer document",
  customer_lmc_pipe_records: "LMC record",
  customer_notes: "note",
  work_progress_updates: "work update",
  site_plans: "plan",
  dpr_records: "DPR",
  payments: "expense",
  material_transactions: "material entry",
  customers: "customer",
  project_sites: "site",
  bills: "bill",
  bill_payments: "bill payment",
  project_members: "team member",
  project_documents: "project document",
};

const TYPE_LABELS: Record<string, string> = {
  customer: "Customer",
  project: "Project",
  project_site: "Site",
  material: "Material",
  plumber: "Plumber",
  staff: "Staff",
  bill: "Bill",
  payment: "Expense",
  site_plan: "Plan",
  dpr_record: "DPR",
};

function typeLabel(item: RecycleBinItem) {
  if (item.entityType === "plumber" && item.subType === "labour") return "Labour";
  return TYPE_LABELS[item.entityType] ?? item.entityType;
}

const filters: ListFilter[] = [
  {
    id: "type",
    label: "Type",
    quick: true,
    options: ["Customer", "Project", "Site", "Material", "Plumber", "Labour", "Staff", "Bill", "Expense", "Plan", "DPR"].map((value) => ({ value, label: value })),
  },
];

function relatedSummary(item: RecycleBinItem) {
  const parts = Object.entries(item.related ?? {})
    .filter(([, count]) => count > 0)
    .map(([table, count]) => `${count} ${RELATED_LABELS[table] ?? table}${count === 1 ? "" : "s"}`);
  return parts.join(", ") || "-";
}

const formatWhen = (value: string) =>
  new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function daysLeft(expiresAt: string) {
  const days = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
  return `${days} day${days === 1 ? "" : "s"}`;
}

const columns: ListColumn<RecycleBinItem>[] = [
  { id: "label", header: "Item", value: (item) => item.label, isTitle: true, hideable: false, sortable: true, width: 240, grow: true },
  { id: "type", header: "Type", value: typeLabel, sortable: true, width: 110 },
  { id: "trBpNumber", header: "BR/TR No.", value: (item) => item.trBpNumber ?? "-", sortable: true, width: 150, defaultHidden: true },
  { id: "projectName", header: "Project", value: (item) => item.projectName ?? "-", sortable: true, width: 220 },
  { id: "related", header: "Deleted with it", value: relatedSummary, width: 220 },
  { id: "deletedByName", header: "Deleted by", value: (item) => item.deletedByName ?? "-", sortable: true, width: 160 },
  { id: "deletedAt", header: "Deleted on", value: (item) => formatWhen(item.deletedAt), sortable: true, width: 170 },
  { id: "expiresAt", header: "Removed in", value: (item) => daysLeft(item.expiresAt), sortable: true, width: 110 },
];

/** Deleted items (customers, projects, materials, ...), restorable for 30 days (admins). */
export function RecycleBinPage() {
  const queryClient = useQueryClient();
  const list = useListState({ pageSize: 50, storageKey: "recycle-bin" });
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: binKey, queryFn: recycleBinApi.list });
  const rows = useClientRows(data, list, { columns, filters });
  const [busyId, setBusyId] = useState("");

  const restore = useMutation({
    mutationFn: (item: RecycleBinItem) => recycleBinApi.restore(item.id),
    onMutate: (item) => setBusyId(item.id),
    onSuccess: (result) => {
      toast.success(`"${result.label}" restored`);
      void queryClient.invalidateQueries({ queryKey: binKey });
      for (const queryKey of RESTORED_KEYS) void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error("Couldn't restore", { description: error instanceof Error ? error.message : undefined }),
    onSettled: () => setBusyId(""),
  });

  const purge = useMutation({
    mutationFn: (item: RecycleBinItem) => recycleBinApi.purge(item.id),
    onSuccess: (result) => {
      toast.success(`"${result.label}" deleted for good`);
      void queryClient.invalidateQueries({ queryKey: binKey });
    },
    onError: (error) => toast.error("Couldn't delete", { description: error instanceof Error ? error.message : undefined }),
  });

  const purgeAll = useMutation({
    mutationFn: recycleBinApi.purgeAll,
    onSuccess: (result) => {
      toast.success(`Recycle bin emptied (${result.count} deleted for good)`);
      void queryClient.invalidateQueries({ queryKey: binKey });
    },
    onError: (error) => toast.error("Couldn't empty the recycle bin", { description: error instanceof Error ? error.message : undefined }),
  });

  const emptyButton = (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button type="button" variant="outline" className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive" />}
        disabled={!data.length || purgeAll.isPending}
      >
        <TrashIcon size={15} />
        {purgeAll.isPending ? "Emptying…" : "Empty Recycle Bin"}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Empty the Recycle Bin?</AlertDialogTitle>
          <AlertDialogDescription>
            {data.length.toLocaleString("en-IN")} deleted item{data.length === 1 ? "" : "s"} will be removed for good. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => purgeAll.mutate()} className="bg-destructive text-white hover:bg-destructive/90">
            Delete all for good
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <PageShell
      title="Recycle Bin"
      actions={emptyButton}
      description="Deleted customers, projects, materials, plumbers, staff, bills, expenses and sites stay here for 30 days with everything deleted along with them. Restore puts it all back as it was."
      fillHeight
    >
      <ListTable
        itemLabel="deleted item"
        rows={rows.pageRows}
        total={rows.total}
        columns={columns}
        state={list}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        filters={filters}
        searchPlaceholder="Search by name, BR/TR or project..."
        empty={{ illustration: "records", title: "The recycle bin is empty." }}
        fillHeight
        rowActionsWidth={190}
        renderRowActions={(item) => (
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" className="gap-1 text-primary" disabled={Boolean(busyId)} onClick={() => restore.mutate(item)}>
              <ArrowCounterClockwiseIcon size={14} />
              {busyId === item.id ? "Restoring…" : "Restore"}
            </Button>
            <DeleteConfirmDialog
              itemName={item.label}
              onConfirm={() => purge.mutate(item)}
              trigger={
                <Button type="button" variant="ghost" size="sm" className="gap-1 text-destructive" aria-label={`Delete ${item.label} for good`}>
                  <TrashIcon size={14} />
                  Delete
                </Button>
              }
            />
          </div>
        )}
      />
    </PageShell>
  );
}
