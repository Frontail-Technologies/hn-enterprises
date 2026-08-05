import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { announcementsApi, type AnnouncementFormValues } from "../services/announcements.service";

const announcementsKey = ["announcements"] as const;

export function useAnnouncementsQuery() {
  return useQuery({
    queryKey: announcementsKey,
    queryFn: () => announcementsApi.list(),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: AnnouncementFormValues) => announcementsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementsKey });
      toast.success("Announcement created successfully");
    },
    onError: () => toast.error("Failed to create announcement"),
  });
}

export function useUpdateAnnouncement(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: AnnouncementFormValues) => announcementsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementsKey });
      toast.success("Announcement updated successfully");
    },
    onError: () => toast.error("Failed to update announcement"),
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementsKey });
      toast.success("Announcement published successfully");
    },
    onError: () => toast.error("Failed to publish announcement"),
  });
}
