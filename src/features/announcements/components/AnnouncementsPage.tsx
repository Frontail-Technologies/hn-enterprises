"use client";

import { MegaphoneIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAnnouncementsPage } from "../hooks/useAnnouncementsPage";
import { useAnnouncementColumns } from "../hooks/useAnnouncementColumns";
import { AnnouncementDialog } from "./AnnouncementDialog";

export function AnnouncementsPage() {
  const screen = useAnnouncementsPage();
  const columns = useAnnouncementColumns({
    onEdit: screen.dialog.openEdit,
    onPublish: screen.publish,
    onRepublish: screen.republish,
    onDelete: screen.delete,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Announcements"
        icon={MegaphoneIcon}
        actions={
          <Button type="button" size="compact" onClick={screen.dialog.openCreate}>
            <PlusIcon size={13} />
            New Announcement
          </Button>
        }
      />

      <BulkDeleteBar
        selectedCount={screen.selection.selectedIds.size}
        onClear={screen.selection.clear}
        onDelete={() => screen.bulkDelete.setOpen(true)}
      />
      <DataTable
        columns={columns}
        data={screen.announcements}
        isLoading={screen.isLoading}
        emptyTitle="No announcements yet"
        emptyDescription="Create an announcement to push it to the mobile app."
        variant="striped"
        selection={{
          selectedIds: screen.selection.selectedIds,
          onToggleRow: screen.selection.toggleRow,
          onTogglePage: screen.selection.toggleAllOnPage,
          getRowLabel: (row) => row.title,
        }}
      />

      <AnnouncementDialog
        open={screen.dialog.open}
        title={screen.dialog.editingId ? "Edit Announcement" : "New Announcement"}
        draft={screen.dialog.draft}
        saveError={screen.dialog.saveError}
        onDraftChange={screen.dialog.onDraftChange}
        onOpenChange={(open) => (open ? screen.dialog.setOpen(true) : screen.dialog.close())}
        onSaveDraft={() => void screen.dialog.save()}
      />

      <BulkDeleteDialog
        open={screen.bulkDelete.open}
        onOpenChange={screen.bulkDelete.setOpen}
        selectedCount={screen.selection.selectedIds.size}
        entityLabel="Announcement"
        isSubmitting={screen.bulkDelete.isPending}
        onConfirm={screen.bulkDelete.confirm}
      />
    </div>
  );
}
