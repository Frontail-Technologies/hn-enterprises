import { apiRequest } from "@/lib/api-client";
import { resolveFileUrl } from "@/lib/upload";
import type { Announcement, AnnouncementStatus } from "../types/announcement.types";

type BackendAnnouncementStatus = "draft" | "sent";

type BackendAnnouncement = {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  imageFileName: string | null;
  status: BackendAnnouncementStatus;
  createdBy: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_TO_FRONTEND: Record<BackendAnnouncementStatus, AnnouncementStatus> = {
  draft: "Draft",
  sent: "Sent",
};

function toDateOnly(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function mapAnnouncement(raw: BackendAnnouncement): Announcement {
  return {
    id: raw.id,
    title: raw.title,
    message: raw.message,
    image: raw.imageUrl
      ? {
          id: raw.id,
          label: raw.imageFileName ?? "Image",
          fileName: raw.imageFileName ?? "",
          previewUrl: resolveFileUrl(raw.imageUrl),
          fileUrl: raw.imageUrl,
          status: "uploaded",
        }
      : undefined,
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    createdBy: raw.createdBy ?? "",
    createdOn: toDateOnly(raw.createdAt),
    sentOn: raw.sentAt ? toDateOnly(raw.sentAt) : undefined,
  };
}

export type AnnouncementFormValues = {
  title: string;
  message: string;
  imageUrl?: string;
  imageFileName?: string;
};

export const announcementsApi = {
  async list(): Promise<Announcement[]> {
    const rows = await apiRequest<BackendAnnouncement[]>("/announcements?limit=200");
    return rows.map(mapAnnouncement);
  },

  async create(values: AnnouncementFormValues): Promise<Announcement> {
    const raw = await apiRequest<BackendAnnouncement>("/announcements", {
      method: "POST",
      body: JSON.stringify({
        title: values.title,
        message: values.message,
        imageUrl: values.imageUrl || undefined,
        imageFileName: values.imageFileName || undefined,
      }),
    });
    return mapAnnouncement(raw);
  },

  async update(id: string, values: AnnouncementFormValues): Promise<Announcement> {
    const raw = await apiRequest<BackendAnnouncement>(`/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: values.title,
        message: values.message,
        imageUrl: values.imageUrl || undefined,
        imageFileName: values.imageFileName || undefined,
      }),
    });
    return mapAnnouncement(raw);
  },

  async publish(id: string): Promise<Announcement> {
    const raw = await apiRequest<BackendAnnouncement>(`/announcements/${id}/publish`, {
      method: "POST",
    });
    return mapAnnouncement(raw);
  },
};
