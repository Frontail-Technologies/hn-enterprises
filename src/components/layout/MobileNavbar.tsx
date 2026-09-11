"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileNavbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const isNestedPage = pathname.split("/").filter(Boolean).length > 1;

  if (isNestedPage) return null;

  return (
    <header className="sticky top-0 z-40 bg-secondary-action md:hidden">
      <div className="flex h-12 items-center gap-2 px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white">
          <Image
            src="/logo.png"
            alt="HN Enterprises"
            width={30}
            height={30}
            priority
            className="h-7 w-7 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-secondary-action-foreground">HN Enterprises</p>
          <p className="truncate text-[10px] font-medium text-secondary-action-foreground/70">CGD Management</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-sm border border-white/15 text-secondary-action-foreground/80 hover:bg-white/10 hover:text-secondary-action-foreground"
          onClick={toggleSidebar}
          aria-label="Open navigation"
        >
          <DotsThreeIcon size={20} weight="bold" />
        </Button>
      </div>
    </header>
  );
}
