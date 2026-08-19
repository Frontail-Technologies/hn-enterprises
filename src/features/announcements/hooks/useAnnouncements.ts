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
    onError: (error: any) => toast.error(error?.message || "Failed to create announcement"),
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
    onError: (error: any) => toast.error(error?.message || "Failed to update announcement"),
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.publish(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: announcementsKey });
      if (result.pushSuccess) {
        toast.success(`Announcement published and pushed to ${result.pushTokenCount} device${result.pushTokenCount === 1 ? "" : "s"}`);
      } else {
        toast.warning(
          `Announcement published, but push delivery failed${result.pushError ? `: ${result.pushError}` : ""}. It's still visible in the mobile app's notification list.`,
        );
      }
    },
    onError: (error: any) => toast.error(error?.message || "Failed to publish announcement"),
  });
}

export function useRepublishAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.republish(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: announcementsKey });
      if (result.pushSuccess) {
        toast.success(`Announcement re-pushed to ${result.pushTokenCount} device${result.pushTokenCount === 1 ? "" : "s"}`);
      } else {
        toast.warning(
          `Announcement re-pushed, but push delivery failed${result.pushError ? `: ${result.pushError}` : ""}. It's still visible in the mobile app's notification list.`,
        );
      }
    },
    onError: (error: any) => toast.error(error?.message || "Failed to re-push announcement"),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementsKey });
      toast.success("Announcement deleted successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to delete announcement"),
  });
}

export function useBulkDeleteAnnouncements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => announcementsApi.bulkDelete(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: announcementsKey });
      toast.success(`${result.count} announcement${result.count === 1 ? "" : "s"} deleted`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete announcements"),
  });
}
