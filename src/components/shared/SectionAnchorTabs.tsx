"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SectionAnchorTabItem = {
  href: string;
  label: string;
};

interface SectionAnchorTabsProps {
  items: SectionAnchorTabItem[];
  className?: string;
}

export function SectionAnchorTabs({
  items,
  className,
}: SectionAnchorTabsProps) {
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? "");
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const updateFromHash = () => {
      if (window.location.hash) setActiveHref(window.location.hash);
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);

    return () => window.removeEventListener("hashchange", updateFromHash);
  }, []);

  // Keep the active tab in view within the horizontally-scrolling nav - the
  // page can jump to an anchor (via hash, back/forward, or a click) faster
  // than the user can manually scroll the tab bar to follow it.
  useEffect(() => {
    tabRefs.current[activeHref]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeHref]);

  return (
    <nav
      className={cn(
        "sticky top-[0px] z-40 -mx-1 overflow-x-auto  bg-background px-1 backdrop-blur",
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
              ref={(el) => {
                tabRefs.current[item.href] = el;
              }}
              data-active={active}
              onClick={() => setActiveHref(item.href)}
              className="inline-flex h-10 shrink-0 items-center border-b-2 border-b-transparent px-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:border-b-primary data-[active=true]:font-semibold data-[active=true]:text-primary"
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
