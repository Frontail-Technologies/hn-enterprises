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

/**
 * Sticky jump-nav for long detail pages. Links are plain #hash anchors
 * (RG-007); the highlighted link follows the section being read.
 */
export function SectionAnchorTabs({ items, className }: SectionAnchorTabsProps) {
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? "");
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const itemsKey = items.map((item) => item.href).join("|");

  // Follow the URL hash (deep links, back/forward).
  useEffect(() => {
    const updateFromHash = () => {
      if (window.location.hash) setActiveHref(window.location.hash);
    };
    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);
    return () => window.removeEventListener("hashchange", updateFromHash);
  }, []);

  // Scroll-spy: highlight the section whose top is in the upper part of the viewport.
  useEffect(() => {
    const sections = itemsKey
      .split("|")
      .map((href) => (href.startsWith("#") ? document.getElementById(href.slice(1)) : null))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!sections.length) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        const first = sections.find((section) => visible.has(section.id));
        if (first) setActiveHref(`#${first.id}`);
      },
      // Band just below the sticky top bar + this nav, covering the upper part of the screen.
      { rootMargin: "-120px 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [itemsKey]);

  useEffect(() => {
    tabRefs.current[activeHref]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeHref]);

  return (
    <nav
      className={cn(
        // Sits below the sticky mobile nested header (h-12) / desktop top bar (h-14).
        "sticky top-12 z-20 -mx-1 overflow-x-auto overflow-y-hidden bg-background/95 px-1 backdrop-blur md:top-14",
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
              aria-current={active ? "location" : undefined}
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
