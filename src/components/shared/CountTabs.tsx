import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CountTabItem {
  label: string;
  value: ReactNode;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

interface CountTabsProps {
  items: CountTabItem[];
  className?: string;
}

export function CountTabs({ items, className }: CountTabsProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-1 border-b border-border/70",
        className,
      )}
    >
      {items.map((item) => {
        const content = (
          <>
            <span className="truncate">{item.label}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground group-data-[active=true]:bg-primary/10 group-data-[active=true]:text-primary">
              {item.value}
            </span>
          </>
        );

        const className =
          "group inline-flex h-8 max-w-full items-center gap-1.5 border-b-2 border-transparent px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:border-primary data-[active=true]:text-primary";

        if (item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              data-active={item.active}
              className={className}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.label}
            type="button"
            data-active={item.active}
            className={className}
            onClick={item.onClick}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
