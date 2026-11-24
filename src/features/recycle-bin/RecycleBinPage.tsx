"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowCounterClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { customersKey } from "@/features/customers/queries/customer.query-keys";
import { recycleBinApi, type RecycleBinItem } from "./recycle-bin.api";

const binKey = ["recycle-bin"] as const;

const RELATED_LABELS: Record<string, string> = {
  complaints: "complaint",
  customer_documents: "document",
  customer_lmc_pipe_records: "LMC record",
  customer_notes: "note",
  work_progress_updates: "work update",
};

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
  { id: "label", header: "Customer", value: (item) => item.label, isTitle: true, hideable: false, sortable: true, width: 220, grow: true },
  { id: "trBpNumber", header: "BR/TR No.", value: (item) => item.trBpNumber ?? "-", sortable: true, width: 150 },
  { id: "projectName", header: "Project", value: (item) => item.projectName ?? "-", sortable: true, width: 220 },
  { id: "related", header: "Deleted with it", value: relatedSummary, width: 220 },
  { id: "deletedByName", header: "Deleted by", value: (item) => item.deletedByName ?? "-", sortable: true, width: 160 },
  { id: "deletedAt", header: "Deleted on", value: (item) => formatWhen(item.deletedAt), sortable: true, width: 170 },
  { id: "expiresAt", header: "Removed in", value: (item) => daysLeft(item.expiresAt), sortable: true, width: 110 },
];

/** Deleted customers, restorable for 30 days (admins). */
export function RecycleBinPage() {
  const queryClient = useQueryClient();
  const list = useListState({ pageSize: 50, storageKey: "recycle-bin" });
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: binKey, queryFn: recycleBinApi.list });
  const rows = useClientRows(data, list, { columns });
  const [busyId, setBusyId] = useState("");

  const restore = useMutation({
    mutationFn: (item: RecycleBinItem) => recycleBinApi.restore(item.id),
    onMutate: (item) => setBusyId(item.id),
    onSuccess: (result) => {
      toast.success(`"${result.label}" restored`);
      void queryClient.invalidateQueries({ queryKey: binKey });
      void queryClient.invalidateQueries({ queryKey: customersKey });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
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

  return (
    <PageShell
      title="Recycle Bin"
      description="Deleted customers stay here for 30 days with their documents, notes, LMC records and complaints. Restore puts everything back as it was."
      fillHeight
    >
      <ListTable
        itemLabel="deleted customer"
        rows={rows.pageRows}
        total={rows.total}
        columns={columns}
        state={list}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
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
