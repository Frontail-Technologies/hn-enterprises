"use client";

import { useState } from "react";
import { CaretDownIcon, DownloadSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { ListTable, useClientRows, type ListColumn } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HolidayDrawer } from "./HolidayDrawer";
import { useHolidaysTab } from "./useHolidaysTab";
import { useDeleteHoliday } from "../../hooks/useMasters";
import { masterTabs, type Holiday, type MasterTabId } from "../../types/masters.types";

const holidayColumns: ListColumn<Holiday>[] = [
  { id: "name", header: "Holiday name", value: (row) => row.name, isTitle: true, hideable: false, sortable: true, width: 260, grow: true },
  { id: "date", header: "Date", value: (row) => row.date, sortable: true, width: 140 },
  { id: "type", header: "Type", value: (row) => row.type, sortable: true, width: 160 },
  { id: "status", header: "Status", value: (row) => row.status, sortable: true, width: 130, cell: (row) => <StatusBadge status={row.status} /> },
];

// Same fields the tab searched before the migration.
const holidaySearchText = (row: Holiday) => `${row.name} ${row.type}`;

export function HolidaysTab({
  activeTab,
  onTabChange,
}: {
  activeTab: MasterTabId;
  onTabChange: (tab: MasterTabId) => void;
}) {
  const tab = useHolidaysTab();
  const { pageRows, total } = useClientRows(tab.holidays, tab.list, { columns: holidayColumns, searchText: holidaySearchText });

  return (
    <PageShell
      title="Masters"
      tabs={
        <div className="border-b border-border">
          <UnderlineTabs items={masterTabs} active={activeTab} onChange={(nextTab) => onTabChange(nextTab as MasterTabId)} />
        </div>
      }
      actions={<HolidayDrawer />}
    >
      <ListTable
        itemLabel="holiday"
        rows={pageRows}
        total={total}
        columns={holidayColumns}
        state={tab.list}
        searchPlaceholder="Search holidays..."
        isLoading={tab.isLoading}
        isError={tab.isError}
        onRetry={() => void tab.refetch()}
        selectable
        getRowLabel={(row) => row.name}
        bulkActions={() => (
          <Button type="button" variant="ghost" size="compact" onClick={() => tab.bulkDelete.onOpenChange(true)}>
            <TrashIcon size={14} />
            Delete
          </Button>
        )}
        rowActionsWidth={88}
        renderRowActions={(row) => (
          <div className="flex items-center gap-0.5">
            <HolidayDrawer holiday={row} iconOnly />
            <DeleteHolidayButton id={row.id} label={row.name} />
          </div>
        )}
        empty={{ illustration: "calendar", title: "No holidays added", description: "Company holidays you add will appear here." }}
        actions={
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
        }
      />

      <BulkDeleteDialog
        open={tab.bulkDelete.open}
        onOpenChange={tab.bulkDelete.onOpenChange}
        selectedCount={tab.list.selection.size}
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
