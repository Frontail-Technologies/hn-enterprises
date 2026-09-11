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
import { type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import type { Announcement } from "../types/announcement.types";

interface UseAnnouncementColumnsArgs {
  onEdit: (announcement: Announcement) => void;
  onPublish: (id: string) => void;
  onRepublish: (id: string) => void;
  onDelete: (id: string) => Promise<unknown>;
}

export function useAnnouncementColumns({
  onEdit,
  onPublish,
  onRepublish,
  onDelete,
}: UseAnnouncementColumnsArgs): ColumnDef<Announcement>[] {
  return [
    {
      key: "image",
      header: "Image",
      className: "w-16",
      render: (announcement) =>
        announcement.image?.previewUrl ? (
          <span className="block h-10 w-10 overflow-hidden rounded-sm border border-border/70 bg-muted/20">
            <Image
              src={announcement.image.previewUrl}
              alt={announcement.image.label}
              width={40}
              height={40}
              className="h-full w-full object-cover"
              unoptimized
            />
          </span>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-dashed border-border bg-muted/10 text-muted-foreground">
            <MegaphoneIcon size={16} />
          </span>
        ),
    },
    {
      key: "title",
      header: "Title",
      render: (announcement) => (
        <div>
          <p className="font-semibold text-foreground">{announcement.title}</p>
          <p className="mt-0.5 line-clamp-1 max-w-sm text-xs text-muted-foreground">{announcement.message}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (announcement) => <StatusBadge status={announcement.status} />,
    },
    { key: "createdOn", header: "Created" },
    {
      key: "sentOn",
      header: "Sent On",
      render: (announcement) => announcement.sentOn || "-",
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32",
      render: (announcement) => (
        <div className="flex items-center gap-1">
          {announcement.status === "Draft" ? (
            <ActionTooltip label="Push to mobile app">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Push announcement"
                onClick={() => onPublish(announcement.id)}
              >
                <PaperPlaneTiltIcon size={14} />
              </Button>
            </ActionTooltip>
          ) : null}
          <ActionTooltip label="Edit">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Edit announcement"
              onClick={() => onEdit(announcement)}
            >
              <PencilSimpleIcon size={14} />
            </Button>
          </ActionTooltip>
          {announcement.status === "Sent" ? (
            <ActionTooltip label="Re-push to mobile app">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Re-push announcement"
                onClick={() => onRepublish(announcement.id)}
              >
                <ArrowsClockwiseIcon size={14} />
              </Button>
            </ActionTooltip>
          ) : null}
          <DeleteConfirmDialog
            itemName={announcement.title}
            onConfirm={() => onDelete(announcement.id)}
          />
        </div>
      ),
    },
  ];
}
