"use client";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { ListTable, useClientRows, useListState, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { useAnnouncementsPage } from "../hooks/useAnnouncementsPage";
import { AnnouncementRowActions, announcementColumns } from "../hooks/useAnnouncementColumns";
import { AnnouncementDialog } from "./AnnouncementDialog";

const filters: ListFilter[] = [
  {
    id: "status",
    label: "Status",
    quick: true,
    options: [
      { value: "Draft", label: "Draft" },
      { value: "Sent", label: "Sent" },
    ],
  },
];

const searchText = (row: { title: string; message: string }) => `${row.title} ${row.message}`;

export function AnnouncementsPage() {
  const screen = useAnnouncementsPage();
  const list = useListState({ pageSize: 50, storageKey: "announcements" });
  const { pageRows, total } = useClientRows(screen.announcements, list, { columns: announcementColumns, filters, searchText });

  return (
    <PageShell
      title="Announcements"
      description="Messages pushed to the mobile app."
      actions={
        <Button type="button" size="compact" onClick={screen.dialog.openCreate}>
          <PlusIcon size={13} />
          New Announcement
        </Button>
      }
    >
      <ListTable
        itemLabel="announcement"
        rows={pageRows}
        total={total}
        columns={announcementColumns}
        state={list}
        filters={filters}
        searchPlaceholder="Search title or message..."
        isLoading={screen.isLoading}
        isError={screen.isError}
        onRetry={() => void screen.refetch()}
        selectable
        getRowLabel={(row) => row.title}
        bulkActions={() => (
          <Button type="button" variant="ghost" size="compact" onClick={() => screen.bulkDelete.setOpen(true)}>
            <TrashIcon size={14} />
            Delete
          </Button>
        )}
        empty={{
          illustration: "records",
          title: "No announcements yet",
          description: "Create an announcement to push it to the mobile app.",
          action: { label: "New announcement", onClick: screen.dialog.openCreate },
        }}
        rowActionsWidth={112}
        renderRowActions={(row) => (
          <AnnouncementRowActions
            announcement={row}
            onEdit={screen.dialog.openEdit}
            onPublish={screen.publish}
            onRepublish={screen.republish}
            onDelete={screen.delete}
          />
        )}
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
        selectedCount={list.selection.size}
        entityLabel="Announcement"
        isSubmitting={screen.bulkDelete.isPending}
        onConfirm={() => screen.bulkDelete.confirm([...list.selection], list.clearSelection)}
      />
    </PageShell>
  );
}
