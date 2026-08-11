"use client";

import {
  CaretDownIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  NotePencilIcon,
  TrashIcon,
  UserSwitchIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BULK_ASSIGN_ACTIONS,
  BULK_UPDATE_ACTIONS,
  type BulkQuickAction,
} from "../../utils/bulk-quick-actions";

interface BulkActionToolbarProps {
  selectedCount: number;
  matchingCount: number;
  showSelectAllBanner: boolean;
  onSelectAllMatching: () => void;
  onClear: () => void;
  onOpenQuickAction: (action: BulkQuickAction) => void;
  onOpenBulkEdit: () => void;
  onOpenRemark: () => void;
  onExportSelected: () => void;
  onOpenDelete: () => void;
  canEdit: boolean;
  canRemark: boolean;
  canDelete: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  matchingCount,
  showSelectAllBanner,
  onSelectAllMatching,
  onClear,
  onOpenQuickAction,
  onOpenBulkEdit,
  onOpenRemark,
  onExportSelected,
  onOpenDelete,
  canEdit,
  canRemark,
  canDelete,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-40 flex flex-col gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span>{selectedCount} selected</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={onClear}
          >
            <XIcon size={13} />
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  />
                }
              >
                <UserSwitchIcon size={14} />
                Assign
                <CaretDownIcon size={11} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {BULK_ASSIGN_ACTIONS.map((action) => (
                  <DropdownMenuItem
                    key={action.field}
                    onClick={() => onOpenQuickAction(action)}
                  >
                    {action.menuLabel}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  />
                }
              >
                Update
                <CaretDownIcon size={11} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-72">
                {BULK_UPDATE_ACTIONS.map((action) => (
                  <DropdownMenuItem
                    key={action.field}
                    onClick={() => onOpenQuickAction(action)}
                  >
                    {action.menuLabel}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={onOpenBulkEdit}
            >
              <NotePencilIcon size={14} />
              Bulk Edit
            </Button>
          )}

          {canRemark && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={onOpenRemark}
            >
              Add Remark
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={onExportSelected}
          >
            <DownloadSimpleIcon size={14} />
            Export Selected
          </Button>

          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2 text-xs"
                    aria-label="More bulk actions"
                  />
                }
              >
                <DotsThreeIcon size={16} weight="bold" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onClick={onOpenDelete}>
                  <TrashIcon size={14} />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {showSelectAllBanner && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>All {selectedCount} customers on this page are selected.</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={onSelectAllMatching}
          >
            Select all {matchingCount} matching filters
          </Button>
        </div>
      )}
    </div>
  );
}
