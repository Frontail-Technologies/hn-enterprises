"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type SectionAnchorTabItem = {
  href: string;
  label: string;
};

interface SectionAnchorTabsProps {
  items: SectionAnchorTabItem[];
  className?: string;
}

export function SectionAnchorTabs({ items, className }: SectionAnchorTabsProps) {
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? "");

  useEffect(() => {
    const updateFromHash = () => {
      if (window.location.hash) setActiveHref(window.location.hash);
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);

    return () => window.removeEventListener("hashchange", updateFromHash);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-12 z-20 -mx-1 overflow-x-auto border-b border-border/70 bg-background/95 px-1 backdrop-blur",
        className,
      )}
      aria-label="Section navigation"
    >
      <div className="flex w-max min-w-full items-center gap-6">
        {items.map((item) => {
          const active = activeHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active}
              onClick={() => setActiveHref(item.href)}
              className="inline-flex h-10 shrink-0 items-center border-b-2 border-transparent px-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:border-primary data-[active=true]:font-semibold data-[active=true]:text-primary"
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
