"use client";

import Image from "next/image";
import {
  ArrowsClockwiseIcon,
  MegaphoneIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import type { ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import type { Announcement } from "../types/announcement.types";

export const announcementColumns: ListColumn<Announcement>[] = [
  {
    id: "image",
    header: "Image",
    width: 64,
    cell: (announcement) =>
      announcement.image?.previewUrl ? (
        <span className="block size-7 overflow-hidden rounded-md border border-border/70 bg-muted/20">
          <Image
            src={announcement.image.previewUrl}
            alt={announcement.image.label}
            width={28}
            height={28}
            className="h-full w-full object-cover"
            unoptimized
          />
        </span>
      ) : (
        <span className="flex size-7 items-center justify-center rounded-md border border-dashed border-border bg-muted/10 text-muted-foreground">
          <MegaphoneIcon size={14} />
        </span>
      ),
  },
  { id: "title", header: "Title", value: (row) => row.title, isTitle: true, hideable: false, sortable: true, width: 240 },
  {
    id: "message",
    header: "Message",
    value: (row) => row.message,
    width: 320,
    grow: true,
    cell: (row) => <span className="text-muted-foreground">{row.message}</span>,
  },
  { id: "status", header: "Status", value: (row) => row.status, sortable: true, width: 110, cell: (row) => <StatusBadge status={row.status} /> },
  { id: "createdOn", header: "Created", value: (row) => row.createdOn, width: 130 },
  { id: "sentOn", header: "Sent on", value: (row) => row.sentOn, width: 130 },
];

interface AnnouncementRowActionsProps {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onPublish: (id: string) => void;
  onRepublish: (id: string) => void;
  onDelete: (id: string) => Promise<unknown>;
}

export function AnnouncementRowActions({ announcement, onEdit, onPublish, onRepublish, onDelete }: AnnouncementRowActionsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {announcement.status === "Draft" ? (
        <ActionTooltip label="Push to mobile app">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Push announcement" onClick={() => onPublish(announcement.id)}>
            <PaperPlaneTiltIcon size={15} />
          </Button>
        </ActionTooltip>
      ) : null}
      <ActionTooltip label="Edit">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit announcement" onClick={() => onEdit(announcement)}>
          <PencilSimpleIcon size={15} />
        </Button>
      </ActionTooltip>
      {announcement.status === "Sent" ? (
        <ActionTooltip label="Re-push to mobile app">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Re-push announcement" onClick={() => onRepublish(announcement.id)}>
            <ArrowsClockwiseIcon size={15} />
          </Button>
        </ActionTooltip>
      ) : null}
      <DeleteConfirmDialog itemName={announcement.title} onConfirm={() => onDelete(announcement.id)} />
    </div>
  );
}
