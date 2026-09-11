"use client";

import { useState } from "react";
import { CaretDownIcon, DatabaseIcon, DownloadSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { PageShell } from "@/components/shared/PageShell";
import { PaginatedDataTable } from "@/components/shared/PaginatedDataTable";
import { HolidayDrawer } from "./HolidayDrawer";
import { useHolidaysTab } from "./useHolidaysTab";
import { useDeleteHoliday } from "../../hooks/useMasters";
import { masterTabs, type Holiday, type MasterTabId } from "../../types/masters.types";

export function HolidaysTab({
  activeTab,
  onTabChange,
}: {
  activeTab: MasterTabId;
  onTabChange: (tab: MasterTabId) => void;
}) {
  const tab = useHolidaysTab();

  const holidayColumns: ColumnDef<Holiday>[] = [
    { key: "name", header: "Holiday Name", render: (row) => <span className="font-semibold text-foreground">{row.name}</span> },
    { key: "date", header: "Date", render: (row) => row.date },
    { key: "type", header: "Type" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (row) => (
        <div className="flex items-center gap-1">
          <HolidayDrawer holiday={row} iconOnly />
          <DeleteHolidayButton id={row.id} label={row.name} />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Masters"
      icon={DatabaseIcon}
      tabs={
        <div className="border-b border-border">
          <UnderlineTabs items={masterTabs} active={activeTab} onChange={(nextTab) => onTabChange(nextTab as MasterTabId)} />
        </div>
      }
      actions={
        <>
          <div className="w-full max-w-full sm:w-64">
            <Input
              value={tab.search.value}
              onChange={(event) => tab.search.onChange(event.target.value)}
              placeholder="Search holidays..."
              className="h-8"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:contents">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button type="button" variant="outline" size="compact">
                    More
                    <CaretDownIcon size={12} />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={tab.exportAction.onExport} disabled={tab.exportAction.isPending}>
                  <DownloadSimpleIcon size={14} />
                  {tab.exportAction.isPending ? "Exporting..." : "Export Excel"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <HolidayDrawer />
          </div>
        </>
      }
      contentClassName="space-y-3"
    >
      <BulkDeleteBar
        selectedCount={tab.selection.selectedIds.size}
        onClear={tab.selection.clear}
        onDelete={() => tab.bulkDelete.onOpenChange(true)}
      />
      <PaginatedDataTable
        data={tab.data}
        columns={holidayColumns}
        isLoading={tab.isLoading}
        selection={{
          selectedIds: tab.selection.selectedIds,
          onToggleRow: tab.selection.toggleRow,
          onTogglePage: tab.selection.toggleAllOnPage,
          getRowLabel: (row) => row.name,
        }}
      />

      <BulkDeleteDialog
        open={tab.bulkDelete.open}
        onOpenChange={tab.bulkDelete.onOpenChange}
        selectedCount={tab.selection.selectedIds.size}
        entityLabel="Holiday"
        isSubmitting={tab.bulkDelete.isPending}
        onConfirm={tab.bulkDelete.onConfirm}
      />
    </PageShell>
  );
}

function DeleteHolidayButton({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useDeleteHoliday();

  function handleConfirm() {
    mutate(id);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ActionTooltip label={`Delete "${label}"`}>
        <PopoverTrigger
          aria-label={`Delete ${label}`}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <TrashIcon size={15} className="text-destructive" />
        </PopoverTrigger>
      </ActionTooltip>
      <PopoverContent className="w-64 p-3" side="left">
        <p className="mb-3 text-sm font-medium">Delete &ldquo;{label}&rdquo;?</p>
        <p className="mb-4 text-xs text-muted-foreground">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" variant="destructive" size="sm" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
