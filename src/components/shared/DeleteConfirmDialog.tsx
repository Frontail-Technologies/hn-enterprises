"use client";

import type { ReactElement } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DeleteConfirmDialogProps {
  itemName: string;
  onConfirm: () => void;
  variant?: "icon" | "full";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
  className?: string;
}

export function DeleteConfirmDialog({
  itemName,
  onConfirm,
  variant = "icon",
  isOpen,
  onOpenChange,
  trigger,
  className,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : isOpen === undefined ? (
        <DialogTrigger
          render={
            variant === "icon" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Delete ${itemName}`}
                className={cn("text-muted-foreground hover:bg-destructive/10 hover:text-destructive", className)}
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn("gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive", className)}
              />
            )
          }
        >
          <TrashIcon size={variant === "icon" ? 13 : 14} />
          {variant === "full" ? "Delete" : null}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {itemName}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. <strong>{itemName}</strong> will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <DialogClose render={<Button type="button" variant="destructive" onClick={onConfirm} />}>
            Delete
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
