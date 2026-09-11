"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { tabItemClassName } from "@/components/shared/tabs/tab-style";

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
        "sticky top-0 z-40 -mx-1 overflow-x-auto overflow-y-hidden bg-background px-1 backdrop-blur",
        className,
      )}
      aria-label="Section navigation"
    >
      <div className="flex w-max min-w-full items-center gap-1 border-b border-border">
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
              className={tabItemClassName(active)}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
