import type { ReactNode } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DrawerShellProps {
  title: string;
  description: string;
  triggerLabel: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  children: ReactNode;
}

export function DrawerShell({
  title,
  description,
  triggerLabel,
  icon,
  iconOnly = false,
  children,
}: DrawerShellProps) {
  return (
    <Sheet>
      {iconOnly ? (
        <ActionTooltip label={triggerLabel}>
          <SheetTrigger
            render={
              <button
                type="button"
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                })}
                aria-label={triggerLabel}
              />
            }
          >
            {icon ?? <PlusIcon size={15} />}
          </SheetTrigger>
        </ActionTooltip>
      ) : (
        <SheetTrigger render={<Button type="button" />}>
          {icon ?? <PlusIcon size={15} />}
          {triggerLabel}
        </SheetTrigger>
      )}
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">{children}</div>
        <SheetFooter className="border-t border-border/70 pb-6">
          <div className="flex w-full items-center justify-between gap-3">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="button" className="min-w-24">Save</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
