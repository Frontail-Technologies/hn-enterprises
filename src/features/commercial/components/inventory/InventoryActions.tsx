"use client";

import { useState } from "react";
import {
  ArrowClockwiseIcon,
  ArrowsLeftRightIcon,
  CaretDownIcon,
  DotsThreeVerticalIcon,
  PlusIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Material } from "../../types/material.types";
import { MaterialDrawer } from "./MaterialDrawer";
import { DeleteImpactDialog } from "@/components/shared/DeleteImpactDialog";
import { useDeleteMaterial, useMaterialDeleteImpactQuery } from "../../hooks/useMaterials";

// One "Add Transaction" menu instead of four equally-weighted buttons (§3) - each
// item opens the same MaterialDrawer form used everywhere else in Inventory, just
// launched from a menu selection instead of its own visible trigger.
const TRANSACTION_MENU = [
  { type: "purchase", label: "Add Purchase", icon: <PlusIcon size={14} /> },
  { type: "pbg_issue", label: "PBG Receipt", icon: <PlusIcon size={14} /> },
  { type: "issue", label: "Issue Material", icon: <UploadSimpleIcon size={14} /> },
  { type: "return", label: "Return Material", icon: <ArrowClockwiseIcon size={14} /> },
  { type: "adjustment", label: "Adjust Balance", icon: <ArrowsLeftRightIcon size={14} /> },
] as const;

export function InventoryActions({ material }: { material: Material }) {
  const deleteMaterial = useDeleteMaterial();
  const [openType, setOpenType] = useState<(typeof TRANSACTION_MENU)[number]["type"] | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteImpact = useMaterialDeleteImpactQuery(material.id, { enabled: deleteOpen });

  return (
    <div className="flex items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" />}>
          Add Transaction
          <CaretDownIcon size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          {TRANSACTION_MENU.map((item) => (
            <DropdownMenuItem key={item.type} onClick={() => setOpenType(item.type)}>
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {TRANSACTION_MENU.map((item) => (
        <MaterialDrawer
          key={item.type}
          type={item.type}
          hideTrigger
          open={openType === item.type}
          onOpenChange={(open) => setOpenType(open ? item.type : null)}
        />
      ))}

      {/* Hard-delete is already blocked server-side once a material has transaction
          history (FK restrict) - this is realistically only reachable for a material
          created by mistake, so it stays a destructive action behind confirmation
          rather than gaining a separate deactivate/status lifecycle. */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="More actions" />}>
          <DotsThreeVerticalIcon size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <TrashIcon size={14} />
            Delete Material
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteImpactDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        entityTypeLabel="Material"
        impact={deleteImpact.data}
        isLoading={deleteImpact.isLoading}
        isError={deleteImpact.isError}
        onRetry={() => void deleteImpact.refetch()}
        isConfirming={deleteMaterial.isPending}
        onConfirm={async () => {
          await deleteMaterial.mutateAsync(material.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
