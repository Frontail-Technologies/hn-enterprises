"use client";

import { useState } from "react";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import {
  useAnnouncementsQuery,
  useCreateAnnouncement,
  usePublishAnnouncement,
  useRepublishAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useBulkDeleteAnnouncements,
} from "./useAnnouncements";
import type { Announcement } from "../types/announcement.types";

const emptyDraft: Announcement = {
  id: "",
  title: "",
  message: "",
  status: "Draft",
  createdBy: "",
  createdOn: "",
};

export function useAnnouncementsPage() {
  const { data: announcements = [], isLoading } = useAnnouncementsQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Announcement>(emptyDraft);
  const [saveError, setSaveError] = useState("");

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement(editingId ?? "");
  const publishMutation = usePublishAnnouncement();
  const republishMutation = useRepublishAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const { selectedIds, toggleRow, toggleAllOnPage, clear } = useBulkSelection();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const bulkDeleteMutation = useBulkDeleteAnnouncements();

  async function handleBulkDelete() {
    await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
    setBulkDeleteOpen(false);
    clear();
  }

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

  const publishRow = (id: string) => {
    void publishMutation.mutateAsync(id);
  };

  const republishRow = (id: string) => {
    void republishMutation.mutateAsync(id);
  };

  const deleteRow = (id: string) => deleteMutation.mutateAsync(id);

  return {
    announcements,
    isLoading,
    dialog: {
      open: dialogOpen,
      editingId,
      draft,
      saveError,
      onDraftChange: setDraft,
      setOpen: setDialogOpen,
      openCreate,
      openEdit,
      close: closeDialog,
      save: saveDraft,
    },
    selection: {
      selectedIds,
      toggleRow,
      toggleAllOnPage,
      clear,
    },
    bulkDelete: {
      open: bulkDeleteOpen,
      setOpen: setBulkDeleteOpen,
      confirm: handleBulkDelete,
      isPending: bulkDeleteMutation.isPending,
    },
    publish: publishRow,
    republish: republishRow,
    delete: deleteRow,
  };
}
