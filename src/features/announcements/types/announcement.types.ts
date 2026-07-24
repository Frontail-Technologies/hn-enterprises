import type { ImagePreviewItem } from "@/components/shared/ImageUploadPreview";

export type AnnouncementStatus = "Draft" | "Sent";

export type Announcement = {
  id: string;
  title: string;
  message: string;
  image?: ImagePreviewItem;
  status: AnnouncementStatus;
  createdBy: string;
  createdOn: string;
  sentOn?: string;
};

export type AnnouncementDraft = Omit<Announcement, "id" | "status" | "createdBy" | "createdOn" | "sentOn">;
