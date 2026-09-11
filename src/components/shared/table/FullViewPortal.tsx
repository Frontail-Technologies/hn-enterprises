"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FullViewProvider } from "./FullViewContext";

export function FullViewPortal({
  active,
  onExit,
  children,
  className,
}: {
  active: boolean;
  onExit: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <FullViewProvider active={active}>
      {active ? (
        <Dialog
          open={active}
          onOpenChange={(open) => {
            if (!open) onExit();
          }}
        >
          <DialogContent
            aria-label="Full view"
            showCloseButton={false}
            className={cn(
              "top-0 left-0 z-50 flex h-full w-full max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none border-0 bg-background p-2 text-foreground shadow-none duration-150 data-open:zoom-in-100 data-closed:zoom-out-100 sm:max-w-none",
              className,
            )}
          >
            {children}
          </DialogContent>
        </Dialog>
      ) : (
        children
      )}
    </FullViewProvider>
  );
}
