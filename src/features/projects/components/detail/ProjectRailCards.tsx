"use client";

import { SectionCard } from "@/components/shared/SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogsQuery } from "@/features/management/hooks/useAuditLogs";
import { useProjectTeamQuery } from "@/features/projects/hooks/useProjects";
import { buildTeamRows } from "../../model/team-roster.model";
import { formatDateTime } from "./project-detail.utils";
import { UserAvatar } from "@/components/shared/UserAvatar";

const PREVIEW = 6;

function RailSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-8 rounded-md" />
      ))}
    </div>
  );
}

/** Who works on this project: role counts and the first few people. */
export function ProjectTeamCard({ projectId }: { projectId: string }) {
  const { data: team, isLoading } = useProjectTeamQuery(projectId);
  const supervisors = team?.supervisors ?? [];
  const plumbers = team?.plumbers ?? [];
  const staff = team?.staff ?? [];
  const rows = buildTeamRows(supervisors, plumbers, staff, "all");
  const counts = [
    [supervisors.length, "supervisor"],
    [plumbers.length, "plumber"],
    [staff.length, "staff"],
  ]
    .filter(([count]) => Number(count) > 0)
    .map(([count, label]) => `${count} ${label}${Number(count) === 1 || label === "staff" ? "" : "s"}`)
    .join(" · ");

  return (
    <SectionCard title="Team" description={isLoading ? undefined : counts || "No one assigned yet"}>
      {isLoading ? (
        <RailSkeleton />
      ) : rows.length ? (
        <ul className="flex flex-col gap-2.5">
          {rows.slice(0, PREVIEW).map((row) => (
            <li key={row.id} className="flex items-center gap-2.5">
              <UserAvatar name={row.name} src={row.avatarUrl} size="sm" />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-[13px] font-medium text-foreground">{row.name}</span>
                <span className="truncate text-xs text-muted-foreground">{row.role}</span>
              </span>
            </li>
          ))}
          {rows.length > PREVIEW ? <li className="text-xs text-muted-foreground">+ {rows.length - PREVIEW} more</li> : null}
        </ul>
      ) : (
        <p className="text-[13px] text-muted-foreground">Supervisors and plumbers appear here once they work on this project.</p>
      )}
    </SectionCard>
  );
}

/** The latest changes recorded for this project. */
export function ProjectActivityCard({ projectId }: { projectId: string }) {
  const { data: logs = [], isLoading } = useAuditLogsQuery({ projectId });

  return (
    <SectionCard title="Recent activity">
      {isLoading ? (
        <RailSkeleton />
      ) : logs.length ? (
        <ol className="flex flex-col">
          {logs.slice(0, PREVIEW).map((log, index, list) => (
            <li key={log.id} className="flex gap-3">
              <span className="flex flex-col items-center">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                {index < list.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 pb-3">
                <span className="text-[13px] text-foreground">{log.description || `${log.action} · ${log.module}`}</span>
                <span className="text-xs text-muted-foreground">
                  {log.user} · {formatDateTime(log.dateTime)}
                </span>
              </span>
            </li>
          ))}
          {logs.length > PREVIEW ? <li className="ps-5 text-xs text-muted-foreground">+ {logs.length - PREVIEW} earlier changes</li> : null}
        </ol>
      ) : (
        <p className="text-[13px] text-muted-foreground">No activity recorded for this project yet.</p>
      )}
    </SectionCard>
  );
}
