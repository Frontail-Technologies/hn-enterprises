"use client";

import Link from "next/link";
import { CaretDownIcon, DatabaseIcon, DownloadSimpleIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { BulkDeleteBar } from "@/components/shared/bulk/BulkDeleteBar";
import { BulkDeleteDialog } from "@/components/shared/bulk/BulkDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { PageShell } from "@/components/shared/PageShell";
import { PaginatedDataTable } from "@/components/shared/PaginatedDataTable";
import { MasterValueDrawer } from "./MasterValueDrawer";
import { MasterValueDeleteButton } from "./MasterValueDeleteButton";
import { useMasterValuesTab } from "./useMasterValuesTab";
import { masterTabs, type MasterTabId, type MasterValue, type MasterValueCategory } from "../../types/masters.types";

export function MasterValuesTab({
  activeTab,
  onTabChange,
}: {
  activeTab: MasterValueCategory;
  onTabChange: (tab: MasterTabId) => void;
}) {
  const category = activeTab;
  const tab = useMasterValuesTab(category);

  const valueColumns: ColumnDef<MasterValue>[] = [
    { key: "value", header: "Value", render: (row) => <span className="font-semibold text-foreground">{row.value}</span> },
    { key: "description", header: "Description" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (row) => (
        <div className="flex items-center gap-1">
          <MasterValueDrawer category={category} value={row} iconOnly />
          <MasterValueDeleteButton value={row} category={category} />
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
              placeholder={`Search ${activeTab.toLowerCase()}...`}
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
                <DropdownMenuItem render={<Link href={`/masters/values/import?category=${encodeURIComponent(category)}`} />}>
                  <UploadSimpleIcon size={14} />
                  Import Values
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <MasterValueDrawer category={category} />
          </div>
        </>
      }
      contentClassName="space-y-3"
    >
      {category === "Material Categories" ? (
        <div className="rounded-sm border border-border bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
          Material categories are only groups like GI Pipe, MDPE Pipe, Valve, Tools. Actual stock items are added from Inventory & Material using Add Material.
        </div>
      ) : null}
      <BulkDeleteBar
        selectedCount={tab.selection.selectedIds.size}
        onClear={tab.selection.clear}
        onDelete={() => tab.bulkDelete.onOpenChange(true)}
      />
      <PaginatedDataTable
        data={tab.data}
        columns={valueColumns}
        isLoading={tab.isLoading}
        selection={{
          selectedIds: tab.selection.selectedIds,
          onToggleRow: tab.selection.toggleRow,
          onTogglePage: tab.selection.toggleAllOnPage,
          getRowLabel: (row) => row.value,
        }}
      />

      <BulkDeleteDialog
        open={tab.bulkDelete.open}
        onOpenChange={tab.bulkDelete.onOpenChange}
        selectedCount={tab.selection.selectedIds.size}
        entityLabel="Value"
        isSubmitting={tab.bulkDelete.isPending}
        onConfirm={tab.bulkDelete.onConfirm}
      />
    </PageShell>
  );
}
