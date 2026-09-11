"use client";

import type { ReactElement } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface DeleteConfirmDialogProps {
  itemName: string;
  onConfirm: () => void;
  variant?: "icon" | "full";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
  className?: string;
  /**
   * Async-safe confirm mode - only takes effect in controlled mode (isOpen/
   * onOpenChange supplied). AlertDialogAction is a plain Close trigger: it
   * closes the instant it's clicked, with no idea whether onConfirm's async
   * work later succeeds or fails. While isConfirming is true, the confirm
   * button instead renders as a plain (non-closing) button showing a
   * "Deleting..." state, both buttons are disabled (no double-submit, no
   * dismiss mid-delete), and closing is left entirely to the caller - call
   * onOpenChange(false) yourself once your onConfirm has actually resolved.
   * Every uncontrolled consumer (isOpen left undefined) is completely
   * unaffected - same AlertDialogAction, same immediate-close behavior.
   */
  isConfirming?: boolean;
}

export function DeleteConfirmDialog({
  itemName,
  onConfirm,
  variant = "icon",
  isOpen,
  onOpenChange,
  trigger,
  className,
  isConfirming = false,
}: DeleteConfirmDialogProps) {
  const isControlled = isOpen !== undefined;

  return (
    <AlertDialog open={isOpen} onOpenChange={isConfirming ? undefined : onOpenChange}>
      {trigger ? (
        <AlertDialogTrigger render={trigger} />
      ) : isOpen === undefined ? (
        <AlertDialogTrigger
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
        </AlertDialogTrigger>
      ) : null}
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. <strong>{itemName}</strong> will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isControlled && isConfirming}>Cancel</AlertDialogCancel>
          {isControlled ? (
            <Button type="button" variant="destructive" onClick={onConfirm} disabled={isConfirming}>
              {isConfirming ? "Deleting..." : "Delete"}
            </Button>
          ) : (
            <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
