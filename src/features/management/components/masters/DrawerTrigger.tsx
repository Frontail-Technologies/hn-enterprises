"use client";

import { NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";

export function DrawerTrigger({ label, iconOnly }: { label: string; iconOnly?: boolean }) {
  if (iconOnly) {
    return (
      <ActionTooltip label={label}>
        <SheetTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={label} />}>
          <NotePencilIcon size={15} />
        </SheetTrigger>
      </ActionTooltip>
    );
  }
  return (
    <SheetTrigger render={<Button type="button" size="compact" />}>
      <PlusIcon size={13} />
      {label}
    </SheetTrigger>
  );
}
