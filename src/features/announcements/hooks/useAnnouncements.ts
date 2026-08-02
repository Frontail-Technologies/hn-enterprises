import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    },
  });
}

export function useUpdateAnnouncement(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: AnnouncementFormValues) => announcementsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementsKey });
    },
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementsKey });
    },
  });
}
