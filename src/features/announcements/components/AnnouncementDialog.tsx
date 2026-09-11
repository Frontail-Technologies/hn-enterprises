"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { ImageUploadPreview, type ImagePreviewItem } from "@/components/shared/ImageUploadPreview";
import type { Announcement } from "../types/announcement.types";

interface AnnouncementDialogProps {
  open: boolean;
  title: string;
  draft: Announcement;
  saveError: string;
  onDraftChange: Dispatch<SetStateAction<Announcement>>;
  onOpenChange: (open: boolean) => void;
  onSaveDraft: () => void;
}

export function AnnouncementDialog({
  open,
  title,
  draft,
  saveError,
  onDraftChange,
  onOpenChange,
  onSaveDraft,
}: AnnouncementDialogProps) {
  const images: ImagePreviewItem[] = draft.image ? [draft.image] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <FormField label="Title">
            <Input
              value={draft.title}
              onChange={(event) => onDraftChange((current) => ({ ...current, title: event.target.value }))}
            />
          </FormField>
          <FormField label="Message">
            <Textarea
              value={draft.message}
              onChange={(event) => onDraftChange((current) => ({ ...current, message: event.target.value }))}
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
          <Button type="button" onClick={onSaveDraft}>
            Save Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
