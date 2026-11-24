"use client";

import { useMemo } from "react";
import { ListTable, useListState, type ListColumn } from "@/components/shared/list";
import { useAuditLogsPageQuery } from "@/features/management/hooks/useAuditLogs";
import type { AuditLog } from "@/features/management/services/audit-logs.service";
import { formatDateTime } from "./project-detail.utils";

const columns: ListColumn<AuditLog>[] = [
  { id: "dateTime", header: "When", value: (log) => formatDateTime(log.dateTime), width: 170 },
  { id: "user", header: "By", value: (log) => log.user || "-", width: 180 },
  { id: "module", header: "Area", value: (log) => log.module, width: 140 },
  { id: "action", header: "Action", value: (log) => log.action, width: 200 },
  { id: "description", header: "Details", value: (log) => log.description || "-", isTitle: true, hideable: false, width: 360, grow: true },
];

/** Everything recorded for this project: who changed what, newest first. */
export function ProjectActivityTab({ projectId }: { projectId: string }) {
  const list = useListState({ pageSize: 50, storageKey: "project-activity" });
  const { data, isLoading, isError, refetch } = useAuditLogsPageQuery({
    projectId,
    search: list.debouncedSearch || undefined,
    page: list.page,
    limit: list.pageSize,
  });
  const rows = useMemo(() => data?.data ?? [], [data]);

  return (
    <ListTable
      itemLabel="activity"
      rows={rows}
      total={data?.pagination?.total ?? rows.length}
      columns={columns}
      state={list}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      searchPlaceholder="Search activity..."
      empty={{ illustration: "records", title: "No activity recorded for this project yet." }}
    />
  );
}
