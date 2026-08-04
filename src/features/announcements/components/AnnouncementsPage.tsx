"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MegaphoneIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FormField } from "@/components/shared/FormField";
import { ImageUploadPreview, type ImagePreviewItem } from "@/components/shared/ImageUploadPreview";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useAnnouncementsQuery,
  useCreateAnnouncement,
  usePublishAnnouncement,
  useUpdateAnnouncement,
} from "../hooks/useAnnouncements";
import type { Announcement } from "../types/announcement.types";

const emptyDraft: Announcement = {
  id: "",
  title: "",
  message: "",
  status: "Draft",
  createdBy: "",
  createdOn: "",
};

export function AnnouncementsPage() {
  const { data: list = [], isLoading } = useAnnouncementsQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Announcement>(emptyDraft);
  const [saveError, setSaveError] = useState("");

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement(editingId ?? "");
  const publishMutation = usePublishAnnouncement();

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setSaveError("");
    setDialogOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setDraft(announcement);
    setSaveError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setSaveError("");
  };

  const draftFormValues = () => ({
    title: draft.title,
    message: draft.message,
    image: draft.image,
  });

  const saveDraft = async () => {
    if (!draft.title.trim() || !draft.message.trim()) return;
    setSaveError("");
    try {
      const values = draftFormValues();
      if (editingId) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }
      closeDialog();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save announcement");
    }
  };

  const publishFromDialog = async () => {
    if (!draft.title.trim() || !draft.message.trim()) return;
    setSaveError("");
    try {
      const values = draftFormValues();
      const saved = editingId
        ? await updateMutation.mutateAsync(values)
        : await createMutation.mutateAsync(values);
      await publishMutation.mutateAsync(saved.id);
      closeDialog();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to push announcement");
    }
  };

  const publishRow = (id: string) => {
    void publishMutation.mutateAsync(id);
  };

  const columns: ColumnDef<Announcement>[] = [
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
                onClick={() => publishRow(announcement.id)}
              >
                <PaperPlaneTiltIcon size={14} />
              </Button>
            </ActionTooltip>
          ) : null}
          {announcement.status === "Draft" ? (
            <ActionTooltip label="Edit">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Edit announcement"
                onClick={() => openEdit(announcement)}
              >
                <MegaphoneIcon size={14} />
              </Button>
            </ActionTooltip>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Announcements"
        subtitle="Create and push announcements to the mobile app."
        actions={
          <Button type="button" onClick={openCreate}>
            <PlusIcon size={15} />
            New Announcement
          </Button>
        }
      />

      <div className="rounded-lg border border-border/70 bg-card p-3">
        <DataTable
          columns={columns}
          data={list}
          isLoading={isLoading}
          emptyTitle="No announcements yet"
          emptyDescription="Create an announcement to push it to the mobile app."
          variant="striped"
        />
      </div>

      <AnnouncementDialog
        open={dialogOpen}
        title={editingId ? "Edit Announcement" : "New Announcement"}
        draft={draft}
        saveError={saveError}
        onDraftChange={setDraft}
        onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}
        onSaveDraft={() => void saveDraft()}
        onPush={() => void publishFromDialog()}
      />
    </div>
  );
}

function AnnouncementDialog({
  open,
  title,
  draft,
  saveError,
  onDraftChange,
  onOpenChange,
  onSaveDraft,
  onPush,
}: {
  open: boolean;
  title: string;
  draft: Announcement;
  saveError: string;
  onDraftChange: React.Dispatch<React.SetStateAction<Announcement>>;
  onOpenChange: (open: boolean) => void;
  onSaveDraft: () => void;
  onPush: () => void;
}) {
  const images: ImagePreviewItem[] = draft.image ? [draft.image] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            This announcement will appear in the Notifications list on the mobile app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="Title">
            <Input
              value={draft.title}
              onChange={(event) => onDraftChange((current) => ({ ...current, title: event.target.value }))}
              placeholder="Holiday notice, safety update, rate revision..."
            />
          </FormField>
          <FormField label="Message">
            <Textarea
              value={draft.message}
              onChange={(event) => onDraftChange((current) => ({ ...current, message: event.target.value }))}
              placeholder="Write the announcement message shown to the mobile app user."
              rows={4}
            />
          </FormField>
          <FormField label="Image (optional)">
            <ImageUploadPreview
              images={images}
              module="announcements"
              onChange={(nextImages) =>
                onDraftChange((current) => ({ ...current, image: nextImages.at(-1) }))
              }
            />
          </FormField>
          {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={onSaveDraft}>
            Save Draft
          </Button>
          <Button type="button" onClick={onPush}>
            <PaperPlaneTiltIcon size={15} />
            Push Notification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
