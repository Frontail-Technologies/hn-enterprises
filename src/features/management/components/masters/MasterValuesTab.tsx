"use client";

import Link from "next/link";
import { CaretDownIcon, DownloadSimpleIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { ListTable, useClientRows, type ListColumn } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MasterValueDrawer } from "./MasterValueDrawer";
import { MasterValueDeleteButton } from "./MasterValueDeleteButton";
import { useMasterValuesTab } from "./useMasterValuesTab";
import { masterTabs, type MasterTabId, type MasterValue, type MasterValueCategory } from "../../types/masters.types";

const valueColumns: ListColumn<MasterValue>[] = [
  { id: "value", header: "Value", value: (row) => row.value, isTitle: true, hideable: false, sortable: true, width: 240 },
  { id: "description", header: "Description", value: (row) => row.description, sortable: true, width: 360, grow: true },
  { id: "status", header: "Status", value: (row) => row.status, sortable: true, width: 130, cell: (row) => <StatusBadge status={row.status} /> },
];

// Same fields the tab searched before the migration.
const valueSearchText = (row: MasterValue) => `${row.value} ${row.description}`;

export function MasterValuesTab({
  activeTab,
  onTabChange,
}: {
  activeTab: MasterValueCategory;
  onTabChange: (tab: MasterTabId) => void;
}) {
  const category = activeTab;
  const tab = useMasterValuesTab(category);
  const { pageRows, total } = useClientRows(tab.values, tab.list, { columns: valueColumns, searchText: valueSearchText });
  const noun = activeTab.toLowerCase();

  return (
    <PageShell
      title="Masters"
      tabs={
        <div className="border-b border-border">
          <UnderlineTabs items={masterTabs} active={activeTab} onChange={(nextTab) => onTabChange(nextTab as MasterTabId)} />
        </div>
      }
      actions={<MasterValueDrawer category={category} />}
      contentClassName="space-y-3"
    >
      {category === "Material Categories" ? (
        <div className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
          Material categories are only groups like GI Pipe, MDPE Pipe, Valve, Tools. Actual stock items are added from Inventory & Material using Add Material.
        </div>
      ) : null}

      <ListTable
        itemLabel="value"
        rows={pageRows}
        total={total}
        columns={valueColumns}
        state={tab.list}
        searchPlaceholder={`Search ${noun}...`}
        isLoading={tab.isLoading}
        isError={tab.isError}
        onRetry={() => void tab.refetch()}
        selectable
        getRowLabel={(row) => row.value}
        bulkActions={() => (
          <Button type="button" variant="ghost" size="compact" onClick={() => tab.bulkDelete.onOpenChange(true)}>
            <TrashIcon size={14} />
            Delete
          </Button>
        )}
        rowActionsWidth={88}
        renderRowActions={(row) => (
          <div className="flex items-center gap-0.5">
            <MasterValueDrawer category={category} value={row} iconOnly />
            <MasterValueDeleteButton value={row} category={category} />
          </div>
        )}
        empty={{ illustration: "records", title: `No ${noun} yet`, description: "Add values here or import them from Excel." }}
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
              <DropdownMenuItem render={<Link href={`/masters/values/import?category=${encodeURIComponent(category)}`} />}>
                <UploadSimpleIcon size={14} />
                Import Values
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <BulkDeleteDialog
        open={tab.bulkDelete.open}
        onOpenChange={tab.bulkDelete.onOpenChange}
        selectedCount={tab.list.selection.size}
        entityLabel="Value"
        isSubmitting={tab.bulkDelete.isPending}
        onConfirm={tab.bulkDelete.onConfirm}
      />
    </PageShell>
  );
}
